import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();

router.post('/sendMessage', sendMessage);
router.get('/message/getMessages', getMessages);

export default router;