import mongoose from 'mongoose';
import cryptoRandomString from 'crypto-random-string';
import User from './user';

const roomSchema = new mongoose.Schema(
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
	const user = new User({ username });
	await user.save();
	const code = cryptoRandomString({ length: 6, type: 'alphanumeric' });
	const room = new Room({ code, users: [ user ] });
	await room.save();
	return room;
};

const Room = mongoose.model('Room', roomSchema);

export default Room;
