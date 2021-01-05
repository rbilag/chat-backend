import express from 'express';
import users from '../controllers/user';
import { encode } from '../middlewares/jwt';

const router = express.Router();

router.post('/login/:userId', encode, (req, res, next) => {});

export default router;
