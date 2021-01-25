import { ERROR_MESSAGES } from '../constants';
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
		} catch (error) {
			console.log(error);
			return res.status(400).json({
				success: false,
				error: error.message
			});
		}
	},
	onCreateRoom: async (req: any, res: any) => {
		try {
			const { description } = req.body;
			const newRoom = await Room.schema.statics.createRoom(req.userId, description.trim());
			return res.status(201).json({
				status: 'success',
				data: { room: newRoom }
			});
		} catch (error) {
			console.log(error);
			return res.status(400).json({
				success: false,
				error: error.message
			});
		}
	},
	onJoinRoom: async (req: any, res: any) => {
		try {
			const { roomCode } = req.body;
			const room = await Room.findOne({ code: roomCode });
			if (room) {
				if (room.users.includes(req.userId)) {
					throw ERROR_MESSAGES.USER_IN_ROOM;
				} else {
					const joinedRoom = await Room.schema.statics.joinRoom(room, req.userId);
					return res.status(200).json({
						status: 'success',
						data: { room: joinedRoom }
					});
				}
			} else {
				throw ERROR_MESSAGES.ROOM_NOT_FOUND;
			}
		} catch (error) {
			console.log(error);
			return res.status(400).json({
				success: false,
				error: error.message
			});
		}
	},
	// ToDO revise
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
					throw ERROR_MESSAGES.USER_NOT_FOUND;
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
				throw ERROR_MESSAGES.ROOM_NOT_FOUND;
			}
		} catch (error) {
			console.log(error);
			return res.status(400).json({
				success: false,
				error: error.message
			});
		}
	}
};
