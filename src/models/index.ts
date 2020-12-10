import mongoose from 'mongoose';
import User from './user';
import Message from './message';
import Room from './room';
 
const connectDb = () => {
  const URL: string = process.env.DATABASE_URL || 'mongodb+srv://admin:I8Z67NjdeQu32Wty@cluster0.ab3xk.mongodb.net/chatappdb?retryWrites=true&w=majority'
  return mongoose.connect(URL);
};
 
const models = { User, Message, Room };
 
export { connectDb };
 
export default models;