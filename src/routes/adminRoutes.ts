import { editUser, deactivateUser, getAllUsers } from '../controllers/userController'
import { getAdminUnreadMessages } from '../controllers/messageController';
import { Router } from 'express';

const router = Router();

// User related
router.get('/getAllUsers', getAllUsers);
router.put('/editUser/:id', editUser);
router.put('/deactivateUser/:id', deactivateUser);

// Messages related
router.get('/messages/unread', getAdminUnreadMessages);

export default router