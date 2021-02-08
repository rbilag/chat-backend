import { Schema, Document, Model, model } from 'mongoose';
import cryptoRandomString from 'crypto-random-string';
import UserModel, { User } from './user';
import Message from './message';

interface RoomUser {
	user: Schema.Types.ObjectId;
	unread?: number;
}
interface RoomUserPopulated {
	user: User;
	unread?: number;
}

export interface Room {
	code: string;
	description: string;
	lastActivity?: Date;
	lastMessagePreview?: string;
	users: Array<RoomUser> | Array<RoomUserPopulated>;
}

export interface RoomDocument extends Room, Document {
	users: Array<RoomUser>;
}

export interface RoomPopulatedDocument extends Room, Document {
	users: Array<RoomUserPopulated>;
}

export interface RoomModel extends Model<RoomDocument> {
	createRoom(userId: Schema.Types.ObjectId, description: string): Promise<RoomPopulatedDocument>;
	joinRoom(room: RoomDocument, userId: Schema.Types.ObjectId): Promise<RoomPopulatedDocument>;
	updatePreview(roomCode: string, message: string): Promise<RoomPopulatedDocument>;
	updateUnread(unread: number, roomCode: string, username: string): Promise<RoomPopulatedDocument>;
	deleteRoom(roomCode: string): Promise<RoomDocument>;
}

const roomSchema = new Schema<RoomDocument>(
	{
		code: {
			type: String,
			unique: true,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		users: [
			{
				user: { type: Schema.Types.ObjectId, ref: 'User' },
				unread: { type: Number, default: 0 }
			}
		],
		lastActivity: {
			type: Date
		},
		lastMessagePreview: {
			type: String
		}
	},
	{ timestamps: true }
);

roomSchema.statics.createRoom = async function(
	this: Model<RoomDocument>,
	userId: Schema.Types.ObjectId,
	description: string
) {
	const code = cryptoRandomString({ length: 6, type: 'alphanumeric' });
	const room = await this.create({ code, description, users: [ { user: userId } ] });
	return await room
		.populate({
			path: 'users.user',
			select: 'firstName lastName username email',
			model: 'User'
		})
		.execPopulate();
};

roomSchema.statics.joinRoom = async function(
	this: Model<RoomDocument>,
	room: RoomDocument,
	userId: Schema.Types.ObjectId
) {
	room.users.push({ user: userId });
	await room.save();

	return await room
		.populate({
			path: 'users.user',
			select: 'firstName lastName username email',
			model: 'User'
		})
		.execPopulate();
};

roomSchema.statics.updatePreview = async function(this: Model<RoomDocument>, roomCode: string, message: string) {
	return await this.findOneAndUpdate(
		{ code: roomCode },
		{ lastMessagePreview: message.slice(0, 40), lastActivity: new Date() },
		{
			new: true
		}
	)
		.populate({
			path: 'users.user',
			select: 'firstName lastName username email',
			model: 'User'
		})
		.exec();
};

roomSchema.statics.updateUnread = async function(
	this: Model<RoomDocument>,
	unread: number,
	roomCode: string,
	username: string
) {
	const user = await UserModel.findOne({ username });
	if (user)
		return await this.findOneAndUpdate(
			{ code: roomCode },
			{ $set: { 'users.$[roomUser].unread': unread } },
			{ arrayFilters: [ { 'roomUser.user': user._id } ], new: true }
		)
			.populate({
				path: 'users.user',
				select: 'firstName lastName username email',
				model: 'User'
			})
			.exec();
};

roomSchema.statics.deleteRoom = async function(this: Model<RoomDocument>, roomCode: string) {
	await Message.deleteMany({ roomCode });
	return await this.findOneAndDelete({ code: roomCode });
};

export default model<RoomDocument, RoomModel>('Room', roomSchema);
