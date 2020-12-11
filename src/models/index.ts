import mongoose from 'mongoose';
import User from './user';
import Message from './message';
import Room from './room';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../config.env') });

const connectDb = () => {
	return mongoose.connect(process.env.DATABASE_URL!, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
};

const models = { User, Message, Room };

export { connectDb };

export default models;
