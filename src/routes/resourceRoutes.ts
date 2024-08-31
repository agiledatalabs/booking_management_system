import { Router } from 'express';
import { getResourceTypes, addResourceType, deleteResourceType, editResourceType } from '../controllers/resourceTypeController';
import { getResources, addResource, updateResourceStatus, deleteResource, editResource } from '@/controllers/resourceController';

const router = Router();

// Resource Types
router.get('/resourceTypes', getResourceTypes);
router.post('/resourceTypes', addResourceType);
router.delete('/resourceTypes/:id', deleteResourceType);
router.put('/resourceTypes/:id', editResourceType);

// Resource
// router.delete('/resources/:id', deleteResource);
router.get('/resources', getResources);
router.post('/resources', addResource);
router.delete('/resources/:id', deleteResource);
router.put('/resources/activeStatus/:id', updateResourceStatus);
router.put('/resources/:id', editResource);

export default router;