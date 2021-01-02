import mongoose from 'mongoose';
import { MessageStatus } from '../constants';
import { ChatMessage } from '../types';
import Room from './room';
import User from './user';

type Message = {
	content: String;
	status: String;
	isSystem: Boolean;
	user: User;
	room: Room;
};
type MessageDocument = mongoose.Document & Message;
type MessageModel = mongoose.Model<MessageDocument>;

const messageSchema = new mongoose.Schema<MessageModel>(
	{
		content: {
			type: String,
			required: true
		},
		status: {
			type: String,
			enum: MessageStatus,
			default: MessageStatus.SENT
		},
		isSystem: {
			type: Boolean,
			default: false
		},
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }
	},
	{ timestamps: true }
);

messageSchema.statics.createMsg = async function({
	userRoom,
	content,
	isSystem = false,
	status = MessageStatus.SENT
}: ChatMessage) {
	const room = await Room.findOne({ code: userRoom.room });
	const user = await User.findOne({ username: isSystem ? 'Chatbot' : userRoom.name });
	if (user && room) {
		const message = await Message.create({ content, isSystem, status, user: user, room: room });
		return message;
	}
};

const Message = mongoose.model<MessageDocument, MessageModel>('Message', messageSchema);

export default Message;
