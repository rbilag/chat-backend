import express from 'express';
import Room from '../models/room';
import User from '../models/user';
import chatRoom from '../controllers/room';

const router = express.Router();

router
	.get('/', chatRoom.getRecentConversation)
	.get('/:roomId', chatRoom.getConversationByRoomId)
	.post('/initiate', chatRoom.initiate)
	.post('/:roomId/message', chatRoom.postMessage)
	.put('/:roomId/mark-read', chatRoom.markConversationReadByRoomId);

router.post('/new', async (req: any, res: any) => {
	try {
		const newRoom = await Room.schema.statics.createRoom(req.userId);
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

router.post('/join', async (req: any, res: any) => {
	try {
		const { roomCode } = req.body;
		const room = await Room.findOne({ code: roomCode });
		if (room) {
			const duplicateUser = await room.users.find((user: any) => user._id === req.userId);
			if (duplicateUser) {
				throw 'User already in room';
			} else {
				const joinedRoom = await Room.schema.statics.joinRoom(room, req.userId);
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
router.post('/leave', async (req, res) => {
	try {
		const { nickname, roomCode } = req.body;
		// TODO optimize? finalize authentication model
		const user = await User.findOne({ username: nickname });
		const room = await Room.findOne({ code: roomCode });
		if (room && user) {
			const userIndex = await room.users.indexOf(user._id);
			console.log(userIndex);
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
