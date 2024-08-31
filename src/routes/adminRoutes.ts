import { editUser, deactivateUser, getAllUsers, createUser, updatePassword } from '@/controllers/userController'
import { getAdminUnreadMessages, adminReplyMessage, getUserMessages } from '@/controllers/messageController';
import { addResourceType, deleteResourceType, editResourceType } from '@/controllers/resourceTypeController'
import { Router } from 'express';
import { addResource, deleteResource, editResource, updateResourceStatus } from '@/controllers/resourceController';

const router = Router();

// User related
router.get('/getAllUsers', getAllUsers);
router.put('/editUser/:id', editUser);
router.put('/deactivateUser/:id', deactivateUser);
router.post('/createUser', createUser);
router.put('/updatePassword/:id', updatePassword);

// Messages related
router.get('/message/getUnread', getAdminUnreadMessages);
router.get('/message/getMessages/:userId', getUserMessages);
router.post("/message/reply", adminReplyMessage)

// Resource Related
router.post('/resources', addResource);
router.delete('/resources/:id', deleteResource);
router.put('/resources/activeStatus/:id', updateResourceStatus);
router.put('/resources/:id', editResource);


// ResourceType related
router.post('/resourceTypes', addResourceType);
router.delete('/resourceTypes/:id', deleteResourceType);
router.put('/resourceTypes/:id', editResourceType);


export default router