import { Router } from 'express';
import { getResourceTypes, addResourceType } from '../controllers/resourceTypeController';
import { getResources } from '../controllers/resourceController';

const router = Router();

router.get('/resourceTypes', getResourceTypes);
router.post('/resourceTypes', addResourceType);
router.get('/resources', getResources);

export default router;