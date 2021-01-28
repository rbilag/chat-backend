import User from '../models/user';

export default {
	onGetAllUsers: async (req: any, res: any) => {
		try {
			const users = await User.getUsers();
			return res.status(200).json({ success: true, users });
		} catch (error) {
			console.log(error);
			return res.status(400).json({ success: false, error: error.message });
		}
	},
	onGetUserById: async (req: any, res: any) => {
		try {
			const user = await User.getUserById(req.params.id);
			return res.status(200).json({ success: true, user });
		} catch (error) {
			console.log(error);
			return res.status(400).json({ success: false, error: error.message });
		}
	},
	onCheckAvailability: async (req: any, res: any) => {
		try {
			let { value, type } = req.body;
			console.log({ value, type });
			const isAvailable = await User.checkAvailability(value, type);
			console.log(isAvailable);
			return res.status(201).json({ success: true, isAvailable });
		} catch (error) {
			console.log(error);
			return res.status(400).json({ success: false, error: error.message });
		}
	},
	changeLoginStatus: async (req: any, res: any) => {
		try {
			let { newValue } = req.body;
			const updatedUser = await User.changeLoginStatus(req.userId, newValue);
			console.log(updatedUser);
			return res.status(200).json({ success: true, user: updatedUser });
		} catch (error) {
			console.log(error);
			return res.status(400).json({ success: false, error: error.message });
		}
	},
	onCreateUser: async (req: any, res: any) => {
		try {
			const user = await User.createUser(req.body);
			return res.status(201).json({ success: true, user });
		} catch (error) {
			console.log(error);
			return res.status(400).json({ success: false, error: error.message });
		}
	},
	onDeleteUserById: async (req: any, res: any) => {
		try {
			const user = await User.deleteUserById(req.params.id);
			return res.status(200).json({
				success: true,
				message: `Deleted user: ${user.username}.`
			});
		} catch (error) {
			console.log(error);
			return res.status(400).json({ success: false, error: error.message });
		}
	}
};
