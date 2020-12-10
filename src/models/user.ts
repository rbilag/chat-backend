import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			unique: true,
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

const User = mongoose.model('User', userSchema);

export default User;
