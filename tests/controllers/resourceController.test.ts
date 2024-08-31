import express from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { addResource, getResources, editResource, updateResourceStatus, deleteResource } from '@/controllers/resourceController';
import { BookingType } from '@/shared/enums';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.post('/resources', addResource);
app.get('/resources', getResources);
app.put('/resources/:id', editResource);
app.put('/resources/:id/status', updateResourceStatus);
app.delete('/resources/:id', deleteResource);

describe('Resource Controller', () => {
  beforeAll(async () => {
    // Setup: Clear the database or create necessary test data
    await prisma.resource.deleteMany({});
    await prisma.resourceType.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup: Close the Prisma Client connection
    await prisma.resource.deleteMany({});
    await prisma.resourceType.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /resources', () => {
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create a resource type
      await prisma.resourceType.deleteMany({});
      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;
    });

    it('should create a new resource', async () => {
      const response = await request(app)
        .post('/resources')
        .send({
          name: 'NewResource',
          resourceTypeId,
          maxQty: 10,
          priceInternal: 100,
          priceExternal: 150,
          bookingType: BookingType.TWO_HOUR,
          active: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'NewResource');

      // Verify the resource was created in the database
      const resource = await prisma.resource.findUnique({
        where: { name: 'NewResource' },
      });
      expect(resource).not.toBeNull();
      expect(resource?.name).toBe('NewResource');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/resources')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain(' is required');
    });

    it('should return 400 if bookingType is invalid', async () => {
      const response = await request(app)
        .post('/resources')
        .send({
          name: 'InvalidResource',
          resourceTypeId,
          maxQty: 10,
          priceInternal: 100,
          priceExternal: 150,
          bookingType: 'INVALID',
          active: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid bookingType');
    });
  });

  describe('GET /resources', () => {
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create resources
      await prisma.resource.deleteMany({});
      await prisma.resourceType.deleteMany({});
      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;

      await prisma.resource.createMany({
        data: [
          {
            name: 'Resource1',
            resourceTypeId,
            maxQty: 10,
            priceInternal: 100,
            priceExternal: 150,
            bookingType: BookingType.TWO_HOUR,
            active: true,
          },
          {
            name: 'Resource2',
            resourceTypeId,
            maxQty: 5,
            priceInternal: 50,
            priceExternal: 75,
            bookingType: 'DAILY',
            active: false,
          },
        ],
      });
    });

    it('should retrieve all resources by resource type ID', async () => {
      const response = await request(app)
        .get('/resources')
        .query({ resourceTypeId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Resource1' }),
          expect.objectContaining({ name: 'Resource2' }),
        ])
      );
    });

    it('should return 400 if resourceTypeId is missing', async () => {
      const response = await request(app)
        .get('/resources')
        .query({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('resourceTypeId cannot be blank');
    });
  });

  describe('PUT /resources/:id', () => {
    let resourceId: number;
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create a resource type and resource
      await prisma.resource.deleteMany({});
      await prisma.resourceType.deleteMany({});
      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;

      const resource = await prisma.resource.create({
        data: {
          name: 'ResourceToEdit',
          resourceTypeId,
          maxQty: 10,
          priceInternal: 100,
          priceExternal: 150,
          bookingType: BookingType.TWO_HOUR,
          active: true,
        },
      });
      resourceId = resource.id;
    });

    it('should edit a resource', async () => {
      const response = await request(app)
        .put(`/resources/${resourceId}`)
        .send({ name: 'UpdatedResource' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'UpdatedResource');

      // Verify the resource was updated in the database
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });
      expect(resource).not.toBeNull();
      expect(resource?.name).toBe('UpdatedResource');
    });

    it('should return 400 if no fields are provided', async () => {
      const response = await request(app)
        .put(`/resources/${resourceId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('At least one field is required to update the resource.');
    });

    it('should return 404 if resource not found', async () => {
      const response = await request(app)
        .put('/resources/99999')
        .send({ name: 'UpdatedResource' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource not found.');
    });
  });

  describe('PUT /resources/:id/status', () => {
    let resourceId: number;
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create a resource type and resource
      await prisma.resource.deleteMany({});
      await prisma.resourceType.deleteMany({});
      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;

      const resource = await prisma.resource.create({
        data: {
          name: 'ResourceToUpdateStatus',
          resourceTypeId,
          maxQty: 10,
          priceInternal: 100,
          priceExternal: 150,
          bookingType: BookingType.TWO_HOUR,
          active: true,
        },
      });
      resourceId = resource.id;
    });

    it('should update the status of a resource', async () => {
      const response = await request(app)
        .put(`/resources/${resourceId}/status`)
        .send({ active: false });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('active', false);

      // Verify the resource status was updated in the database
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });
      expect(resource).not.toBeNull();
      expect(resource?.active).toBe(false);
    });

    it('should return 400 if active status is not provided', async () => {
      const response = await request(app)
        .put(`/resources/${resourceId}/status`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Active status is required.');
    });
  });

  describe('DELETE /resources/:id', () => {
    let resourceId: number;
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Clear the database and create a resource type and resource
      await prisma.resource.deleteMany({});
      await prisma.resourceType.deleteMany({});
      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;

      const resource = await prisma.resource.create({
        data: {
          name: 'ResourceToDelete',
          resourceTypeId,
          maxQty: 10,
          priceInternal: 100,
          priceExternal: 150,
          bookingType: BookingType.TWO_HOUR,
          active: true,
        },
      });
      resourceId = resource.id;
    });

    it('should delete a resource', async () => {
      const response = await request(app)
        .delete(`/resources/${resourceId}`);

      expect(response.status).toBe(204);

      // Verify the resource was deleted in the database
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });
      expect(resource).toBeNull();
    });

    it('should return 404 if resource not found', async () => {
      const response = await request(app)
        .delete('/resources/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource not found');
    });
  });
});