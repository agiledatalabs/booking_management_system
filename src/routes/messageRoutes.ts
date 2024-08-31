import express from 'express';
import { sendMessage, getMessages, markMessageAsRead } from '../controllers/messageController';

const router = express.Router();

router.post('/message/sendMessage', sendMessage);
router.get('/message/getMessages', getMessages);
router.get('message/markRead/:messageId', markMessageAsRead);

export default router;