import jwt from 'jsonwebtoken';
import User from '../models/user';

export const encode = async (req: any, res: any, next: any) => {
	try {
		const user = await User.schema.statics.findByLogin(req.body.username);
		if (user && user.password === req.body.password) {
			const authToken = jwt.sign(
				{
					userId: user._id
				},
				process.env.SECRET_KEY!
			);
			console.log('Auth', authToken);
			req.authToken = authToken;
			next();
		} else {
			return res.status(401).json({ success: false, error: 'Invalid credentials' });
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error.error });
	}
};

export const decode = (req: any, res: any, next: any) => {
	if (!req.headers['authorization']) {
		return res.status(400).json({ success: false, message: 'No access token provided' });
	}
	const accessToken = req.headers.authorization.split(' ')[1];
	try {
		const decoded: any = jwt.verify(accessToken, process.env.SECRET_KEY!);
		console.log(decoded);
		req.userId = decoded.userId;
		return next();
	} catch (error) {
		return res.status(401).json({ success: false, message: error.message });
	}
};
