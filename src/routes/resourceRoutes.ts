import { Router } from 'express';
import { getResourceTypes, addResourceType, addResource } from '../controllers/resourceTypeController';

const router = Router();

router.get('/resource-types', getResourceTypes);
router.post('/resource-types', addResourceType);
router.post('/resources', addResource);

export default router;