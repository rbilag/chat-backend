import User from '../models/user';

export default {
	onGetAllUsers: async (req: any, res: any) => {
		try {
			const users = await User.schema.statics.getUsers();
			return res.status(200).json({ success: true, users });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onGetUserById: async (req: any, res: any) => {
		try {
			const user = await User.schema.statics.getUserById(req.params.id);
			return res.status(200).json({ success: true, user });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onCreateUser: async (req: any, res: any) => {
		try {
			const user = await User.schema.statics.createUser(req.body);
			return res.status(200).json({ success: true, user });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ success: false, error: error });
		}
	},
	onDeleteUserById: async (req: any, res: any) => {
		try {
			const user = await User.schema.statics.deleteUserById(req.params.id);
			return res.status(200).json({
				success: true,
				message: `Deleted user: ${user.username}.`
			});
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	}
};
