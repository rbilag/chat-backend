import jwt from 'jsonwebtoken';
import User from '../models/user';
import bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../constants';

export const encode = async (req: any, res: any, next: any) => {
	try {
		const user = await User.schema.statics.findByLogin(req.body.username);
		if (user) {
			const matches = await bcrypt.compare(req.body.password, user.password);
			if (matches) {
				const authToken = jwt.sign(
					{
						userId: user._id
					},
					process.env.SECRET_KEY!
				);
				console.log('Auth', authToken);
				req.authToken = authToken;
				req.username = user.username;
				next();
			} else {
				return res.status(401).json({ success: false, error: ERROR_MESSAGES.UNAUTHORIZED });
			}
		} else {
			return res.status(400).json({ success: false, error: ERROR_MESSAGES.USER_NOT_FOUND });
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error.error });
	}
};

export const decode = (req: any, res: any, next: any) => {
	if (!req.headers['authorization']) {
		return res.status(400).json({ success: false, message: ERROR_MESSAGES.NO_TOKEN });
	}
	const accessToken = req.headers.authorization.split(' ')[1];
	try {
		const decoded: any = jwt.verify(accessToken, process.env.SECRET_KEY!);
		req.userId = decoded.userId;
		return next();
	} catch (error) {
		return res.status(401).json({ success: false, message: error.message });
	}
};
