import { Schema, Document, Model, model } from 'mongoose';
import { MessageStatus } from '../constants';
import { ChatMessage } from '../types';
import UserModel, { User } from './user';

export interface Message {
	content: string;
	status: string;
	isSystem: boolean;
	user: Schema.Types.ObjectId | User;
	roomCode: string;
}

export interface MessageDocument extends Message, Document {
	user: Schema.Types.ObjectId;
}

export interface MessagePopulatedDocument extends Message, Document {
	user: User;
}

export interface MessageModel extends Model<MessageDocument> {
	createMsg(chatMessage: ChatMessage): Promise<MessagePopulatedDocument>;
	getMsgs(roomCode: string): Promise<MessagePopulatedDocument>;
}

const messageSchema = new Schema<MessageDocument>(
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

messageSchema.statics.createMsg = async function(
	this: Model<MessageDocument>,
	{ userRoom, content, isSystem = false, status = MessageStatus.SENT }: ChatMessage
) {
	const user = await UserModel.findOne({ username: isSystem ? 'Chatbot' : userRoom.name });
	if (user) {
		const message = await this.create({ content, isSystem, status, user: user._id, roomCode: userRoom.room });
		return await this.populate(message, {
			path: 'user',
			select: 'username firstName lastName',
			model: 'User'
		});
	}
};

messageSchema.statics.getMsgs = async function(this: Model<MessageDocument>, roomCode: string) {
	return await this.find({ roomCode })
		.populate({
			path: 'user',
			select: 'username firstName lastName',
			model: 'User'
		})
		.exec();
};

const Message = model<MessageDocument, MessageModel>('Message', messageSchema);

export default Message;
