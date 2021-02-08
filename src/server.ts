import User from './models/user';
import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketio, { Server as IOServer, Socket } from 'socket.io';
import cors, { CorsOptions } from 'cors';
import logger from 'morgan';

import indexRouter from './routes/index';
import userRouter from './routes/user';
import roomRouter from './routes/room';
import messageRouter from './routes/message';
import deleteRouter from './routes/delete';
import { decode } from './middlewares/jwt';

import { ChatEvent, ERROR_MESSAGES, WELCOME_MESSAGES } from './constants';
import { ChatMessage } from './types';
import { connectDb } from './config/index';
import models from './models';
import { joinRoom, disconnect, countUserSockets } from './utils/users';
import Message from './models/message';

const PORT: string | number = process.env.PORT || 8080;
// const WHITELIST = [
// 	'http://localhost:3000',
// 	'http://localhost:8080',
// 	`https://rose-chat-backend.herokuapp.com`,
// 	`http://rose-chat-backend.herokuapp.com`
// ];
const corsOptions: CorsOptions = {
	// origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
	// 	console.log('ORIGIN');
	// 	console.log(origin);
	// 	if (origin && WHITELIST.indexOf(origin) !== -1) {
	// 		callback(null, true);
	// 	} else {
	// 		callback(new Error('Not allowed by CORS'));
	// 	}
	// },
	credentials: false
};
const app: Application = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
const server: HttpServer = createServer(app);
const io: IOServer = (socketio as any)(server, { cors: corsOptions });

app.set('io', io);

connectDb().then(async () => {
	io.on(ChatEvent.CONNECT, (socket: Socket) => {
		console.log(`Client connected..`);
		socket.on(ChatEvent.JOIN, async ({ userRoom, isFirst }: any) => {
			console.log('User joined room');
			console.log(`[user]: ${JSON.stringify(userRoom)}`);
			joinRoom(socket.id, userRoom.name, userRoom.room);
			socket.join(userRoom.room);
			if (isFirst) {
				try {
					const newMsg = await Message.createMsg({
						userRoom,
						content: WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)].replace(
							'{{name}}',
							userRoom.name
						),
						isSystem: true
					});
					const userDetails = await User.getUserByUsername(userRoom.name);
					io.to(userRoom.room).emit(ChatEvent.MESSAGE, { newMsg });
					socket.to(userRoom.room).emit(ChatEvent.JOIN, { userDetails, joinedRoom: userRoom.room });
				} catch (err) {
					console.log(err);
				}
			}
		});

		socket.on(ChatEvent.MESSAGE, async (m: ChatMessage) => {
			console.log('Message has been emitted');
			console.log(`[message]: ${JSON.stringify(m)}`);
			try {
				const newMsg = await models.Message.createMsg({
					userRoom: m.userRoom,
					content: m.content
				});
				const updatedRoom = await models.Room.updatePreview(m.userRoom.room, newMsg.content);
				io.to(m.userRoom.room).emit(ChatEvent.MESSAGE, { newMsg, updatedRoom });
			} catch (err) {
				console.log(err);
			}
		});

		socket.on(ChatEvent.UNREAD, async ({ unread, roomCode, username }) => {
			console.log('Update unread has been emitted');
			console.log(`[update unread]: ${JSON.stringify({ unread, roomCode, username })}`);
			try {
				await models.Room.updateUnread(unread, roomCode, username);
			} catch (err) {
				console.log(err);
			}
		});

		socket.on(ChatEvent.DISCONNECT, async () => {
			console.log('Client disconnected');
			const user = disconnect(socket.id);
			if (user) {
				const userDetails = await User.findByLogin(user.username);
				if (countUserSockets(user.username) === 0) User.changeLoginStatus(userDetails._id, false);
			}
		});
	});

	const URL_PREFIX = '/api/v1';
	app.use(`${URL_PREFIX}`, indexRouter);
	app.use(`${URL_PREFIX}/users`, decode, userRouter);
	app.use(`${URL_PREFIX}/rooms`, decode, roomRouter);
	app.use(`${URL_PREFIX}/messages`, decode, messageRouter);
	app.use(`${URL_PREFIX}/delete`, deleteRouter);
	app.use('*', (req, res) => {
		return res.status(404).json({
			success: false,
			message: ERROR_MESSAGES.ENDPOINT_NOT_FOUND
		});
	});

	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});
