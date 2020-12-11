import { Router } from 'express';
import models from './models';

const router = Router();

router.get('/', (req, res) => {
	res.send('Welcome to Chat Backend!');
});

router.post('/rooms/new', async (req, res) => {
	const { nickname } = req.body;
	try {
		const newRoom = await models.Room.schema.statics.createRoom(nickname);
		res.status(201).json({
			status: 'success',
			data: { room: newRoom }
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err
		});
	}
});

router.post('/rooms/join', async (req, res) => {
	// check if room exists
	// check if no nickname dup in room
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

export default router;
