import User from './models/user';
import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketio, { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
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
import { joinRoom, disconnect, leaveRoom, countUserSockets } from './utils/users';
import Message from './models/message';

const app: Application = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options('*', cors());
const server: HttpServer = createServer(app);
const io: IOServer = socketio(server);

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
					io.to(userRoom.room).emit(ChatEvent.MESSAGE, newMsg);
					socket.to(userRoom.room).emit(ChatEvent.JOIN, { userDetails });
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
				io.to(m.userRoom.room).emit(ChatEvent.MESSAGE, newMsg);
			} catch (err) {
				console.log(err);
			}
		});

		socket.on(ChatEvent.LEAVE, async ({ userRoom }: any) => {
			console.log('Leave has been emitted');
			try {
				const socketIDs = leaveRoom(userRoom.room, userRoom.username);
				socketIDs.forEach((socketID) => {
					io.sockets.sockets[socketID].leave(userRoom.room);
				});
				const newMsg = await models.Message.createMsg({
					userRoom,
					content: `${userRoom.name} left the room.`,
					isSystem: true
				});
				io.to(userRoom.room).emit(ChatEvent.MESSAGE, newMsg);
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

	const PORT: string | number = process.env.PORT || 8080;
	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});
