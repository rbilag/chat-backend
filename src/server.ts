import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketio, { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import { ChatEvent } from './constants';
import { ChatMessage, UserRoom } from './types';
import { connectDb } from './models';
import routes from './routes';

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

		socket.on(ChatEvent.JOIN, (u: UserRoom) => {
			console.log('User joined room');
			console.log(`[user]: ${JSON.stringify(u)}`);
			socket.emit(ChatEvent.SYSTEM, `Welcome to room ${u.room}!`);
			socket.broadcast.emit(ChatEvent.SYSTEM, `${u.name} has entered the room.`);
		});

		socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
			console.log('Message has been emitted');
			console.log(`[message]: ${JSON.stringify(m)}`);
			io.emit(ChatEvent.MESSAGE, m);
		});

		socket.on(ChatEvent.DISCONNECT, () => {
			console.log('Client disconnected');
			io.emit(ChatEvent.SYSTEM, 'A user has left the room.');
		});
	});

	app.use('/api/v1', routes);

	const PORT: string | number = process.env.PORT || 8080;
	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});
