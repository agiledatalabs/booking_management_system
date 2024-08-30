import { Router } from 'express';
import { createUser, deactivateUser, editUser, updatePassword } from '../controllers/userController'
import authRoutes from "./authRoutes"
const router = Router();

// authorization
router.use(authRoutes)
router.post('/createUser', createUser);
router.put('/deactivateUser/:id', deactivateUser);
router.put('/editUser/:id', editUser);
router.put('/updatePassword/:id', updatePassword);

export default router;