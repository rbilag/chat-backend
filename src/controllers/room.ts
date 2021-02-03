import { ChatEvent } from './../constants';
import { deleteRoom, leaveRoom } from '../utils/users';
import { ERROR_MESSAGES } from '../constants';
import Room from '../models/room';
import Message from '../models/message';
import User from '../models/user';

const onGetRooms = async (req: any, res: any) => {
	try {
		const rooms = await Room.find({ users: req.userId })
			.populate({
				path: 'users',
				select: 'firstName lastName username email',
				model: 'User'
			})
			.exec();
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
};

const onCreateRoom = async (req: any, res: any) => {
	try {
		const { description } = req.body;
		const newRoom = await Room.createRoom(req.userId, description.trim());
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
};

const onJoinRoom = async (req: any, res: any) => {
	try {
		const { roomCode } = req.body;
		const room = await Room.findOne({ code: roomCode });
		if (room) {
			if (room.users.includes(req.userId)) {
				throw ERROR_MESSAGES.USER_IN_ROOM;
			} else {
				const joinedRoom = await Room.joinRoom(room, req.userId);
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
};

const onLeaveRoom = async (req: any, res: any) => {
	try {
		const { roomCode } = req.body;
		const room = await Room.findOne({ code: roomCode });
		if (room) {
			const userIndex = room.users.indexOf(req.userId);
			console.log(userIndex);
			if (userIndex < 0) {
				throw ERROR_MESSAGES.USER_NOT_FOUND;
			} else {
				const userDetails = await User.getUserById(req.userId);
				const sockets = req.app.get('io').sockets.sockets;
				const socketIDs = leaveRoom(roomCode, userDetails.username);
				sockets[socketIDs[0]].to(roomCode).emit(ChatEvent.LEAVE, { userDetails, leftRoom: roomCode });
				if (room.users.length === 1) {
					await Room.deleteRoom(room.code);
				} else {
					room.users.splice(userIndex, 1);
					await room.save();
					const newMsg = await Message.createMsg({
						userRoom: { name: userDetails.username, room: roomCode },
						content: `${userDetails.username} left the room.`,
						isSystem: true
					});
					sockets[socketIDs[0]].to(roomCode).emit(ChatEvent.MESSAGE, newMsg);
				}
				socketIDs.forEach((socketID, i) => {
					sockets[socketID].leave(roomCode);
				});
				return res.status(200).json({
					status: 'success'
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
};

const onDeleteRoom = async (req: any, res: any) => {
	const { roomCode } = req.body;
	const io = req.app.get('io');
	io.to(roomCode).emit(ChatEvent.ROOM_DELETE, roomCode);
	const socketIDs = deleteRoom(roomCode);
	socketIDs.forEach((socketID) => {
		io.sockets.sockets[socketID].leave(roomCode);
	});
	await Room.deleteRoom(roomCode);
	return res.status(200).json({
		status: 'success'
	});
};

// TODO implement
// getRecentConversation, getConversationByRoomId, markConversationReadByRoomId

export default { onGetRooms, onCreateRoom, onJoinRoom, onLeaveRoom, onDeleteRoom };
