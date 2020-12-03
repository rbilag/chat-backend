import express from 'express';
import http from 'http';
import cors from 'cors';
import socketIO, { Server, Socket } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 9000;
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(express.json());

io.on('connection', (socket: Socket) => {});
app.get('/', (req, res) => res.status(200).send('Welcome to Chat App Server!'));
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
