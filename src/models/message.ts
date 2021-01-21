import { Schema, Document, Model, model } from 'mongoose';
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
type MessageDocument = Document & Message;
type MessageModel = Model<MessageDocument>;

const messageSchema = new Schema<MessageModel>(
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
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
	console.log(user);
	if (user) {
		const message = await Message.create({ content, isSystem, status, user: user._id, roomCode: userRoom.room });
		console.log(message);
		return await Message.populate(message, {
			path: 'user',
			select: 'username',
			model: 'User'
		});
	}
};

messageSchema.statics.getMsgs = async function(roomCode: String) {
	console.log(roomCode);
	const messages = await Message.find({ roomCode }).populate({
		path: 'user',
		select: 'username',
		model: 'User'
	});
	console.log(messages);
	return messages;
};

const Message = model<MessageDocument, MessageModel>('Message', messageSchema);

export default Message;
