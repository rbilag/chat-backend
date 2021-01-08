import Room from '../models/room';
import User from '../models/user';

export default {
	// initiate: async (req: any, res: any) => {},
	// postMessage: async (req: any, res: any) => {},
	// getRecentConversation: async (req: any, res: any) => {},
	// getConversationByRoomId: async (req: any, res: any) => {},
	// markConversationReadByRoomId: async (req: any, res: any) => {}

	onGetRooms: async (req: any, res: any) => {
		try {
			const rooms = await Room.find({ users: req.userId });
			console.log(rooms);
			return res.status(200).json({
				status: 'success',
				data: { rooms }
			});
		} catch (err) {
			return res.status(400).json({
				success: false,
				error: err
			});
		}
	},
	onCreateRoom: async (req: any, res: any) => {
		try {
			const newRoom = await Room.schema.statics.createRoom(req.userId);
			return res.status(201).json({
				status: 'success',
				data: { room: newRoom }
			});
		} catch (err) {
			return res.status(400).json({
				success: false,
				error: err
			});
		}
	},
	onJoinRoom: async (req: any, res: any) => {
		try {
			const { roomCode } = req.body;
			const room = await Room.findOne({ code: roomCode });
			if (room) {
				const duplicateUser = await room.users.find((user: any) => user._id === req.userId);
				if (duplicateUser) {
					throw 'User already in room';
				} else {
					const joinedRoom = await Room.schema.statics.joinRoom(room, req.userId);
					return res.status(200).json({
						status: 'success',
						data: { room: joinedRoom }
					});
				}
			} else {
				throw 'Room not found';
			}
		} catch (err) {
			return res.status(400).json({
				success: false,
				error: err
			});
		}
	},
	onLeaveRoom: async (req: any, res: any) => {
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
					return res.status(200).json({
						status: 'success',
						data: { room }
					});
				}
			} else {
				throw 'Room not found';
			}
		} catch (err) {
			return res.status(400).json({
				success: false,
				error: err
			});
		}
	}
};
