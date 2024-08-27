import express from 'express';
import { addResource, addResourceType, getResourceTypes } from './controllers/resourceTypeController';

const router = express.Router();

router.post('/resource-types', addResourceType);
router.get('/resource-types', getResourceTypes);
router.post('/resources', addResource);

export default router;