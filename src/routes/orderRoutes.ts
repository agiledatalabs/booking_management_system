import { Router } from 'express';
import { blockOrder, confirmOrder } from '../controllers/orderController';

const router = Router();

router.post('/blockOrder', blockOrder);
router.post('/confirmOrder', confirmOrder);

export default router;