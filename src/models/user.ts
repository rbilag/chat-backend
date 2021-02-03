import { Document, Model, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../constants';

export interface User {
	username: string;
	firstName: string;
	lastName?: string;
	email: string;
	password: string;
	isOnline: boolean;
}

export interface UserDocument extends User, Document {
	getFullName(): string;
}

export interface UserModel extends Model<UserDocument> {
	createUser(userDetails: User): Promise<UserDocument>;
	checkAvailability(value: string, type: string): boolean;
	changeLoginStatus(id: string, newValue: boolean): Promise<UserDocument>;
	getUserById(id: string): Promise<UserDocument>;
	getUserByUsername(username: string): Promise<UserDocument>;
	getUsers(): Promise<UserDocument>;
	findByLogin(login: string): Promise<UserDocument>;
	deleteUserById(id: string): Promise<UserDocument>;
}

const userSchema = new Schema<UserModel>(
	{
		username: {
			type: String,
			required: true,
			unique: true
		},
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		isOnline: {
			type: Boolean,
			required: true,
			default: false
		}
		// socketID
	},
	{ timestamps: true }
);

userSchema.methods.getFullName = function(this: UserDocument) {
	return this.firstName + ' ' + this.lastName;
};

userSchema.statics.createUser = async function(this: Model<UserDocument>, userDetails: User) {
	try {
		const hash = await bcrypt.hash(userDetails.password, 10);
		userDetails.password = hash;
		return await this.create(userDetails);
	} catch (error) {
		throw error;
	}
};

userSchema.statics.checkAvailability = async function(this: Model<UserDocument>, value: string, type: string) {
	try {
		const existingUser =
			type === 'email' ? await this.findOne({ email: value }) : await this.findOne({ username: value });
		return existingUser ? false : true;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.changeLoginStatus = async function(this: Model<UserDocument>, id: string, newValue: boolean) {
	try {
		const user = await this.findByIdAndUpdate(id, { isOnline: newValue });
		if (!user) throw { error: ERROR_MESSAGES.USER_NOT_FOUND };
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.getUserById = async function(this: Model<UserDocument>, id: string) {
	try {
		const user = await this.findOne({ _id: id }, { firstName: 1, lastName: 1, username: 1, email: 1 });
		if (!user) throw { error: ERROR_MESSAGES.USER_NOT_FOUND };
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.getUserByUsername = async function(this: Model<UserDocument>, username: string) {
	try {
		const user = await this.findOne({ username }, { firstName: 1, lastName: 1, username: 1, email: 1 });
		if (!user) throw { error: ERROR_MESSAGES.USER_NOT_FOUND };
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.getUsers = async function(this: Model<UserDocument>) {
	try {
		return await this.find();
	} catch (error) {
		throw error;
	}
};

userSchema.statics.findByLogin = async function(this: Model<UserDocument>, login: string) {
	try {
		// todo merge query
		console.log(this);
		console.log(login);
		let user = await this.findOne({
			username: login
		});
		if (!user) {
			user = await this.findOne({ email: login });
		}
		return user;
	} catch (error) {
		throw error;
	}
};

userSchema.statics.deleteUserById = async function(this: Model<UserDocument>, id: string) {
	try {
		// todo try findbyidanddelete
		return await this.findOneAndDelete({ _id: id });
	} catch (error) {
		throw error;
	}
};

// TODO handling of deleted user's msgs and rooms
// userSchema.pre('remove', function(next: any) {
// 	this.model('Message').deleteMany({ user: this._id }, next);
// });

// TODO password hash
// userSchema.pre<UserDocument>("save", function(next) {
//   if (this.isModified("password")) {
//     this.password = hashPassword(this.password)
//   }
// });

export default model<UserDocument, UserModel>('User', userSchema);
