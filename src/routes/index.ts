import express from 'express';
import User from '../models/user';
import { encode } from '../middlewares/jwt';

const router = express.Router();

router.post('/login', encode, async (req: any, res: any, next: any) => {
	return res.status(200).json({
		success: true,
		authorization: req.authToken,
		data: { username: req.username }
	});
});

export default router;
