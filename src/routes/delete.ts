import express from 'express';
import deleteController from '../controllers/delete';

const router = express.Router();

router
	.delete('/room/:roomId', deleteController.deleteRoomById)
	.delete('/message/:messageId', deleteController.deleteMessageById);

export default router;
