import { editUser, deactivateUser, getAllUsers } from '@/controllers/userController'
import { getAdminUnreadMessages, adminReplyMessage, getUserMessages } from '@/controllers/messageController';
import { Router } from 'express';

const router = Router();

// User related
router.get('/getAllUsers', getAllUsers);
router.put('/editUser/:id', editUser);
router.put('/deactivateUser/:id', deactivateUser);

// Messages related
router.get('/message/getUnread', getAdminUnreadMessages);
router.get('/message/getMessages/:userId', getUserMessages);
router.post("/message/reply", adminReplyMessage)

export default router