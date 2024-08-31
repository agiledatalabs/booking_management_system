import { Router } from 'express';
import { getResourceTypes } from '../controllers/resourceTypeController';
import { getResources } from '@/controllers/resourceController';
import { sendMessage, getMessages, markMessageAsRead } from '../controllers/messageController';
import { blockOrder, confirmOrder } from '@/controllers/orderController';
import { register, login } from "@/controllers/authController"

const router = Router();

// Authentication
router.post("/login", login)
router.post("/register", register)

// Resource Types
router.get('/resourceTypes', getResourceTypes);

// Resource
router.get('/resources', getResources);

// Users
router.post('/message/sendMessage', sendMessage);
router.get('/message/getMessages', getMessages);
router.get('message/markRead/:messageId', markMessageAsRead);

//
router.post('/blockOrder', blockOrder);
router.post('/confirmOrder', confirmOrder);


export default router;