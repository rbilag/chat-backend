import mongoose from 'mongoose';
import cryptoRandomString from 'crypto-random-string';
import User from './user';

type Room = {
	code: String;
	description: String;
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
		description: {
			type: String,
			required: true
		},
		users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]
	},
	{ timestamps: true }
);

roomSchema.statics.createRoom = async function(userId: String, description: String) {
	const user = await User.findById(userId);
	if (user) {
		const code = await cryptoRandomString({ length: 6, type: 'alphanumeric' });
		const room = await Room.create({ code, description, users: [ user ] });
		return room;
	}
};

roomSchema.statics.joinRoom = async function(room: RoomDocument, userId: String) {
	const user = await User.findById(userId);
	if (user) {
		await room.users.push(user);
		await room.save();
		return room;
	}
};

const Room = mongoose.model<RoomDocument, RoomModel>('Room', roomSchema);

export default Room;
