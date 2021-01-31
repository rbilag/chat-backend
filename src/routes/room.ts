import express from 'express';
import room from '../controllers/room';

const router = express.Router();

router.get('/', room.onGetRooms);
router.post('/new', room.onCreateRoom);
router.post('/join', room.onJoinRoom);
router.post('/leave', room.onLeaveRoom);
router.post('/delete', room.onDeleteRoom);

// router
// 	.get('/', room.getRecentConversation)
// 	.get('/:roomId', room.getConversationByRoomId)
// 	.post('/initiate', room.initiate)
// 	.post('/:roomId/message', room.postMessage)
// 	.put('/:roomId/mark-read', room.markConversationReadByRoomId);

export default router;
