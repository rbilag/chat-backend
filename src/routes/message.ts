import express from 'express';
import message from '../controllers/message';

const router = express.Router();

router.post('/', message.onGetMessages);

export default router;
