import express from 'express';
import message from '../controllers/message';

const router = express.Router();

router.get('/', message.onGetMessages);

export default router;
