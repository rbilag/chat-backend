import express from 'express';
import chatRoom from '../controllers/room';

const router = express.Router();

router
	.get('/', chatRoom.getRecentConversation)
	.get('/:roomId', chatRoom.getConversationByRoomId)
	.post('/initiate', chatRoom.initiate)
	.post('/:roomId/message', chatRoom.postMessage)
	.put('/:roomId/mark-read', chatRoom.markConversationReadByRoomId);

export default router;
