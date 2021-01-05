import User from '../models/user';

export default {
	onGetAllUsers: async (req: any, res: any) => {},
	onGetUserById: async (req: any, res: any) => {},
	onCreateUser: async (req: any, res: any) => {
		try {
			const user = await User.schema.statics.createUser(req.body);
			return res.status(200).json({ success: true, user });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ success: false, error: error });
		}
	},
	onDeleteUserById: async (req: any, res: any) => {}
};
