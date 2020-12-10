import './env';
import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketio, { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { ChatEvent } from './constants';
import { ChatMessage, UserRoom } from './types';

const app: Application = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());
const server: HttpServer = createServer(app);
const io: IOServer = socketio(server);
const DB: string | undefined = process.env['DB_CONN'];

mongoose.connect('DB', {
	userCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const db = mongoose.connection;

db.once('open', () => {
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
});

app.post('/api/v1/rooms/join', (req, res) => {
	const dbMessage = req.body;
	// Rooms.find((err, data) => {
	//   if (err) {
	//     res.status(500).send(err);
	//   } else {
	//     console.log(data);
	//     // check username sa data
	//     res.status(200).send(data);
	//   }
	// });
});

const PORT: string | undefined = process.env['PORT'];
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
