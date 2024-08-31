import request from 'supertest';
import express from 'express';
import { getResourceTypes, addResourceType, deleteResourceType, editResourceType } from '@/controllers/resourceTypeController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.get('/resourceTypes', getResourceTypes);
app.post('/resourceTypes', addResourceType);
app.delete('/resourceTypes/:id', deleteResourceType);
app.put('/resourceTypes/:id', editResourceType);

describe('ResourceType Controller', () => {
  beforeAll(async () => {
    // Setup: Clear the database or create necessary test data
    await prisma.resourceType.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup: Close the Prisma Client connection
    await prisma.resourceType.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /resourceTypes', () => {
    beforeAll(async () => {
      // Setup: Create some resource types
      await prisma.resourceType.createMany({
        data: [
          { name: 'Type1' },
          { name: 'Type2' },
        ],
      });
    });

    it('should return a list of resource types', async () => {
      const response = await request(app).get('/resourceTypes');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name', 'Type1');
      expect(response.body[1]).toHaveProperty('name', 'Type2');
    });
  });

  describe('POST /resourceTypes', () => {
    it('should create a new resource type', async () => {
      const response = await request(app)
        .post('/resourceTypes')
        .send({ name: 'NewType' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'NewType');

      // Verify the resource type was created in the database
      const resourceType = await prisma.resourceType.findUnique({
        where: { name: 'NewType' },
      });
      expect(resourceType).not.toBeNull();
      expect(resourceType?.name).toBe('NewType');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/resourceTypes')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must not be empty');
    });

    it('should return 400 if name is blank', async () => {
      const response = await request(app)
        .post('/resourceTypes')
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must not be empty');
    });

    it('should return 400 if name is too short', async () => {
      const response = await request(app)
        .post('/resourceTypes')
        .send({ name: 'ab' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name must be between 3 and 50 characters long');
    });

    it('should return 400 if name is too long', async () => {
      const response = await request(app)
        .post('/resourceTypes')
        .send({ name: 'a'.repeat(51) });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name must be between 3 and 50 characters long');
    });
  });

  describe('DELETE /resourceTypes/:id', () => {
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Create a resource type to delete
      const resourceType = await prisma.resourceType.create({
        data: { name: 'DeleteType' },
      });
      resourceTypeId = resourceType.id;
    });

    it('should delete a resource type', async () => {
      const response = await request(app).delete(`/resourceTypes/${resourceTypeId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Resource type deleted successfully');

      // Verify the resource type was deleted from the database
      const resourceType = await prisma.resourceType.findUnique({
        where: { id: resourceTypeId },
      });
      expect(resourceType).toBeNull();
    });

    it('should return 404 if resource type not found', async () => {
      const response = await request(app).delete('/resourceTypes/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource type not found.');
    });
  });

  describe('PUT /resourceTypes/:id', () => {
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Create a resource type to edit
      const resourceType = await prisma.resourceType.create({
        data: { name: 'EditType' },
      });
      resourceTypeId = resourceType.id;
    });

    it('should edit a resource type', async () => {
      const response = await request(app)
        .put(`/resourceTypes/${resourceTypeId}`)
        .send({ name: 'UpdatedType' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'UpdatedType');

      // Verify the resource type was updated in the database
      const resourceType = await prisma.resourceType.findUnique({
        where: { id: resourceTypeId },
      });
      expect(resourceType).not.toBeNull();
      expect(resourceType?.name).toBe('UpdatedType');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .put(`/resourceTypes/${resourceTypeId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must not be empty');
    });

    it('should return 400 if name is blank', async () => {
      const response = await request(app)
        .put(`/resourceTypes/${resourceTypeId}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must not be empty');
    });

    it('should return 400 if name is too short', async () => {
      const response = await request(app)
        .put(`/resourceTypes/${resourceTypeId}`)
        .send({ name: 'ab' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name must be between 3 and 50 characters long');
    });

    it('should return 400 if name is too long', async () => {
      const response = await request(app)
        .put(`/resourceTypes/${resourceTypeId}`)
        .send({ name: 'a'.repeat(51) });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name must be between 3 and 50 characters long');
    });

    it('should return 404 if resource type not found', async () => {
      const response = await request(app)
        .put('/resourceTypes/99999')
        .send({ name: 'UpdatedType' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource type not found.');
    });
  });
});