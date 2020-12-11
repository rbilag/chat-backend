import mongoose from 'mongoose';

type User = {
	username: String;
};
type UserDocument = mongoose.Document & User;
type UserModel = mongoose.Model<UserDocument>;

const userSchema = new mongoose.Schema<UserModel>(
	{
		username: {
			type: String,
			required: true
		}
	},
	{ timestamps: true }
);

userSchema.statics.findByLogin = async function(login: String) {
	let user = await this.findOne({
		username: login
	});
	if (!user) {
		user = await this.findOne({ email: login });
	}
	return user;
};

userSchema.pre('remove', function(next: any) {
	this.model('Message').deleteMany({ user: this._id }, next);
});

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default User;
