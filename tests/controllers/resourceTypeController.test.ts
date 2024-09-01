import express from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import {
  getResourceTypes,
  addResourceType,
  deleteResourceType,
  editResourceType,
} from '@/controllers/resourceTypeController';

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

  describe('POST /resourceTypes', () => {
    beforeAll(async () => {
      // Setup: Clear the database and create a resource type
      await prisma.resourceType.deleteMany({});
      await prisma.resourceType.create({
        data: { name: 'ExistingType' },
      });
    });

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
      const response = await request(app).post('/resourceTypes').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Name is required and must not be empty'
      );
    });

    it('should return 400 if resource type with the same name already exists', async () => {
      const response = await request(app)
        .post('/resourceTypes')
        .send({ name: 'ExistingType' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'A resource type with this name already exists'
      );
    });
  });

  describe('PUT /resourceTypes/:id', () => {
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create resource types
      await prisma.resourceType.deleteMany({});
      const resourceType1 = await prisma.resourceType.create({
        data: { name: 'Type1' },
      });
      await prisma.resourceType.create({
        data: { name: 'Type2' },
      });
      resourceTypeId = resourceType1.id;
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
      expect(response.body.error).toBe(
        'Name is required and must not be empty'
      );
    });

    it('should return 404 if resource type not found', async () => {
      const response = await request(app)
        .put('/resourceTypes/99999')
        .send({ name: 'UpdatedType' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource type not found.');
    });
  });

  describe('DELETE /resourceTypes/:id', () => {
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create a resource type
      await prisma.resourceType.deleteMany({});
      const resourceType = await prisma.resourceType.create({
        data: { name: 'TypeToDelete' },
      });
      resourceTypeId = resourceType.id;
    });

    it('should delete a resource type', async () => {
      const response = await request(app).delete(
        `/resourceTypes/${resourceTypeId}`
      );

      expect(response.status).toBe(204);

      // Verify the resource type was deleted in the database
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

  describe('GET /resourceTypes', () => {
    beforeAll(async () => {
      // Setup: Clear the database and create resource types
      await prisma.resourceType.deleteMany({});
      await prisma.resourceType.createMany({
        data: [{ name: 'Type1' }, { name: 'Type2' }],
      });
    });

    it('should retrieve all resource types', async () => {
      const response = await request(app).get('/resourceTypes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Type1' }),
          expect.objectContaining({ name: 'Type2' }),
        ])
      );
    });
  });
});
