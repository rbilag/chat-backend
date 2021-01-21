import { Schema, Document, Model, model } from 'mongoose';
import cryptoRandomString from 'crypto-random-string';
import User from './user';

type Room = {
	code: String;
	description: String;
	users: Array<Schema.Types.ObjectId>;
};
type RoomDocument = Document & Room;
type RoomModel = Model<RoomDocument>;

const roomSchema = new Schema<RoomModel>(
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
		users: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
	},
	{ timestamps: true }
);

roomSchema.statics.createRoom = async function(userId: Schema.Types.ObjectId, description: String) {
	const code = await cryptoRandomString({ length: 6, type: 'alphanumeric' });
	const room = await Room.create({ code, description, users: [ userId ] });
	return await Room.populate(room, { path: 'users', select: 'firstName lastName username email', model: 'User' });
};

roomSchema.statics.joinRoom = async function(room: RoomDocument, userId: Schema.Types.ObjectId) {
	await room.users.push(userId);
	await room.save();
	return await Room.populate(room, { path: 'users', select: 'firstName lastName username email', model: 'User' });
};

const Room = model<RoomDocument, RoomModel>('Room', roomSchema);

export default Room;
