import { Router } from 'express';
import { createUser, deactivateUser, editUser, updatePassword } from '../controllers/userController'
const router = Router();

router.post('/createUser', createUser);
router.put('/deactivateUser/:id', deactivateUser);
router.put('/api/editUser/:id', editUser);
router.put('/api/updatePassword/:id', updatePassword);

export default router;