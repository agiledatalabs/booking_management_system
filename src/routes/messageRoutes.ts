import express from 'express';
import { sendMessage, replyMessage, getUserMessages, getAdminUnreadMessages, getConversation } from '../controllers/messageController';

const router = express.Router();

router.post('/messages', sendMessage);
router.post('/messages/reply', replyMessage);
router.get('/messages/user/:userId', getUserMessages);
router.get('/messages/admin/unread', getAdminUnreadMessages);
router.get('/messages/conversation/:userIdY', getConversation);

export default router;