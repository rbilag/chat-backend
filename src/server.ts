
import express, { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import socketIO, { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import { ChatEvent } from './constants';
import { ChatMessage } from './types';

const PORT: string | number = process.env.PORT || 9000;
const app: Application = express();
app.use(cors());
app.options('*', cors());
const server: HttpServer = createServer(app);
const io: IOServer = socketIO(server);

app.use(express.json());
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

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

io.on(ChatEvent.CONNECT, (socket: Socket) => {
    console.log(`Client connected on port ${PORT}`);
    socket.emit(ChatEvent.SYSTEM, 'Welcome to the chat room!');
    socket.broadcast.emit(ChatEvent.SYSTEM, 'A user has entered the room.');

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