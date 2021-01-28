import { Schema, Document, Model, model } from 'mongoose';
import cryptoRandomString from 'crypto-random-string';
import { User } from './user';

export interface Room {
	code: string;
	description: string;
	users: Array<Schema.Types.ObjectId> | Array<User>;
}

// interface RoomBaseDocument extends Room, Document {
// 	code: string;
// 	description: string;
// }

export interface RoomDocument extends Room, Document {
	users: Array<Schema.Types.ObjectId>;
}

export interface RoomPopulatedDocument extends Room, Document {
	users: Array<User>;
}

export interface RoomModel extends Model<RoomDocument> {
	createRoom(userId: Schema.Types.ObjectId, description: string): Promise<RoomPopulatedDocument>;
	joinRoom(room: RoomDocument, userId: Schema.Types.ObjectId): Promise<RoomPopulatedDocument>;
}

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

roomSchema.statics.createRoom = async function(
	this: Model<RoomDocument>,
	userId: Schema.Types.ObjectId,
	description: string
) {
	const code = await cryptoRandomString({ length: 6, type: 'alphanumeric' });
	const room = await this.create({ code, description, users: [ userId ] });
	return await room
		.populate({
			path: 'users',
			select: 'firstName lastName username email',
			model: 'User'
		})
		.execPopulate();
	// ---------------------------------------------------------
	// await this.create({ code, description, users: [ userId ] }, (error, room) => {
	// 	console.log('IN MODEL AFTER CREATE');
	// 	console.log(room);
	// 	this.populate(room, {
	// 		path: 'users',
	// 		select: 'firstName lastName username email',
	// 		model: 'User'
	// 	}).then((populatedRoom) => {
	// 		console.log('IN MODEL IN POPULATE');
	// 		console.log(populatedRoom);
	// 		return populatedRoom;
	// 	});

	// ---------------------------------------------------------
	// room
	// 	.populate({ path: 'users', select: 'firstName lastName username email', model: 'User' })
	// 	.execPopulate((error, populatedRoom) => {
	// 		console.log('IN MODEL IN POPULATE');
	// 		console.log(populatedRoom);
	// 		return populatedRoom;
	// 	});
};

roomSchema.statics.joinRoom = async function(
	this: Model<RoomDocument>,
	room: RoomDocument,
	userId: Schema.Types.ObjectId
) {
	await room.users.push(userId);
	await room.save();

	return await room
		.populate({
			path: 'users',
			select: 'firstName lastName username email',
			model: 'User'
		})
		.execPopulate();
};

export default model<RoomDocument, RoomModel>('Room', roomSchema);
