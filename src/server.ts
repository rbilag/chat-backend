import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketio, { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import { ChatEvent, MessageStatus } from './constants';
import { ChatMessage, UserRoom } from './types';
import { connectDb } from './models';
import routes from './routes';
import models from './models';

const app: Application = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());
const server: HttpServer = createServer(app);
const io: IOServer = socketio(server);

connectDb().then(async () => {
	console.log('DB Connected..');
	io.on(ChatEvent.CONNECT, (socket: Socket) => {
		console.log(`Client connected..`);

		socket.on(ChatEvent.JOIN, async (userRoom: UserRoom) => {
			console.log('User joined room');
			console.log(`[user]: ${JSON.stringify(userRoom)}`);
			try {
				const newMsg = await models.Message.schema.statics.createMsg({
					userRoom,
					content: `${userRoom.name} has joined the party! Welcome to ${userRoom.room}.`,
					isSystem: true
				});
				io.emit(ChatEvent.MESSAGE, newMsg);
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
			io.emit(ChatEvent.MESSAGE, newMsg);
		});

		socket.on(ChatEvent.DISCONNECT, () => {
			console.log('Client disconnected');
			io.emit(ChatEvent.MESSAGE, 'A user has left the room.');
		});
	});

	app.use('/api/v1', routes);

	const PORT: string | number = process.env.PORT || 8080;
	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});
