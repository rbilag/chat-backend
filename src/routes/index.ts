import express from 'express';
import User from '../models/user';
import user from '../controllers/user';
import { encode } from '../middlewares/jwt';

const router = express.Router();
router.get('/', async (req: any, res: any) => {
	return res.status(200).json({
		success: true,
		data: 'Welcome to Chat backend!'
	});
});
router.post('/register', user.onCreateUser);
router.post('/login', encode, async (req: any, res: any, next: any) => {
	const userDetails = await User.getUserByUsername(req.username);
	return res.status(200).json({
		success: true,
		authorization: req.authToken,
		data: { userDetails }
	});
});
router.post('/users/checkAvailability', user.onCheckAvailability);

export default router;
