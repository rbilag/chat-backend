import mongoose from 'mongoose';
import cryptoRandomString from 'crypto-random-string';
import User from './user';

type Room = {
	code: String;
	users: Array<User>;
};
type RoomDocument = mongoose.Document & Room;
type RoomModel = mongoose.Model<RoomDocument>;

const roomSchema = new mongoose.Schema<RoomModel>(
	{
		code: {
			type: String,
			unique: true,
			required: true
		},
		users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]
	},
	{ timestamps: true }
);

roomSchema.statics.createRoom = async function(username: String) {
	const user = await User.create({ username });
	const code = await cryptoRandomString({ length: 6, type: 'alphanumeric' });
	const room = await Room.create({ code, users: [ user ] });
	return room;
};

roomSchema.statics.joinRoom = async function(room: RoomDocument, username: String) {
	const user = await User.create({ username });
	await room.users.push(user);
	await room.save();
	return room;
};

const Room = mongoose.model<RoomDocument, RoomModel>('Room', roomSchema);

export default Room;
