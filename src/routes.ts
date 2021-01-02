import { Router } from 'express';
import models from './models';

const router = Router();

router.get('/', (req, res) => {
	res.send('Welcome to Chat Backend!');
});

router.post('/rooms/new', async (req, res) => {
	try {
		const newRoom = await models.Room.schema.statics.createRoom(req.body.nickname);
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
	try {
		const { nickname, roomCode } = req.body;
		const room = await models.Room.findOne({ code: roomCode });
		if (room) {
			const duplicateUser = await room.users.find((user) => user.username === nickname);
			if (duplicateUser) {
				throw 'Nickname already exists';
			} else {
				const joinedRoom = await models.Room.schema.statics.joinRoom(room, nickname);
				res.status(201).json({
					status: 'success',
					data: { room: joinedRoom }
				});
			}
		} else {
			throw 'Room not found';
		}
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err
		});
	}
});

// todo add auth token
router.post('/rooms/leave', async (req, res) => {
	try {
		const { nickname, roomCode } = req.body;
		// TODO optimize? finalize authentication model
		const user = await models.User.findOne({ username: nickname });
		const room = await models.Room.findOne({ code: roomCode });
		if (room && user) {
			const userIndex = await room.users.indexOf(user._id);
			if (userIndex < 0) {
				throw 'User does not exist';
			} else {
				// TODO delete room if last user left
				await room.users.splice(userIndex, 1);
				room.save();
				res.status(201).json({
					status: 'success',
					data: { room }
				});
			}
		} else {
			throw 'Room not found';
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: 'fail',
			message: err
		});
	}
});

export default router;
