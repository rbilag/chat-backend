import mongoose from 'mongoose';
import { MessageStatus } from '../constants';
import { ChatMessage } from '../types';
import User from './user';

type Message = {
	content: String;
	status: String;
	isSystem: Boolean;
	user: User;
	roomCode: String;
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
		roomCode: {
			type: String,
			required: true
		}
	},
	{ timestamps: true }
);

messageSchema.statics.createMsg = async function({
	userRoom,
	content,
	isSystem = false,
	status = MessageStatus.SENT
}: ChatMessage) {
	const user = await User.findOne({ username: isSystem ? 'Chatbot' : userRoom.name });
	if (user) {
		const message = await Message.create({ content, isSystem, status, user: user._id, roomCode: userRoom.room });
		return message;
	}
};

messageSchema.statics.getMsgs = async function(roomCode: String) {
	console.log(roomCode);
	const messages = await Message.find({ roomCode }).populate({
		path: 'user',
		select: 'firstName lastName username email',
		model: 'User'
	});
	console.log(messages);
	return messages;
};

const Message = mongoose.model<MessageDocument, MessageModel>('Message', messageSchema);

export default Message;
