import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketio, { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import logger from 'morgan';

import indexRouter from './routes/index';
import userRouter from './routes/user';
import roomRouter from './routes/room';
import deleteRouter from './routes/delete';
import { decode } from './middlewares/jwt';

import { ChatEvent, MessageStatus, WELCOME_MESSAGES } from './constants';
import { ChatMessage, UserRoom } from './types';
import { connectDb } from './config/index';
import models from './models';
import { joinRoom, disconnect } from './utils/users';

const app: Application = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options('*', cors());
const server: HttpServer = createServer(app);
const io: IOServer = socketio(server);

connectDb().then(async () => {
	io.on(ChatEvent.CONNECT, (socket: Socket) => {
		console.log(`Client connected..`);

		socket.on(ChatEvent.JOIN, async (userRoom: UserRoom) => {
			console.log('User joined room');
			console.log(`[user]: ${JSON.stringify(userRoom)}`);
			joinRoom(socket.id, userRoom.name, userRoom.room);
			try {
				const newMsg = await models.Message.schema.statics.createMsg({
					userRoom,
					content: WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)].replace(
						'{{name}}',
						userRoom.name
					),
					isSystem: true
				});
				io.to(userRoom.room).emit(ChatEvent.MESSAGE, newMsg);
			} catch (err) {
				console.log(err);
			}
		});

		socket.on(ChatEvent.MESSAGE, async (m: ChatMessage) => {
			console.log('Message has been emitted');
			console.log(`[message]: ${JSON.stringify(m)}`);
			const newMsg = await models.Message.schema.statics.createMsg({
				userRoom: m.userRoom,
				content: m.content
			});
			io.to(m.userRoom.room).emit(ChatEvent.MESSAGE, newMsg);
		});

		socket.on(ChatEvent.DISCONNECT, () => {
			console.log('Client disconnected');
			const user = disconnect(socket.id);
			if (user) {
				io.to(user.room).emit(ChatEvent.MESSAGE, `${user.username} user has left the room.`);
			}
		});
	});

	const URL_PREFIX = '/api/v1';
	app.use(`${URL_PREFIX}`, indexRouter);
	app.use(`${URL_PREFIX}/users`, userRouter);
	app.use(`${URL_PREFIX}/rooms`, decode, roomRouter);
	app.use(`${URL_PREFIX}/delete`, deleteRouter);
	app.use('*', (req, res) => {
		return res.status(404).json({
			success: false,
			message: "API endpoint doesn't exist"
		});
	});

	const PORT: string | number = process.env.PORT || 8080;
	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});
