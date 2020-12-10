import mongoose from 'mongoose';

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

const Room = mongoose.model('Room', roomSchema);

export default Room;
