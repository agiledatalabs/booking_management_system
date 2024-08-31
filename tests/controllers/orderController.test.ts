import express from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { blockOrder, confirmOrder } from '@/controllers/orderController';
import { BookingType, TimeSlots } from '@/shared/enums';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.post('/orders/blockOrder', blockOrder);
app.post('/orders/confirmOrder', confirmOrder);

describe('Order Controller', () => {
  beforeAll(async () => {
    // Setup: Clear the database or create necessary test data
    await prisma.order.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.resourceType.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup: Close the Prisma Client connection
    await prisma.order.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.resourceType.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /orders/blockOrder', () => {
    let userId: number;
    let resourceId: number;
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Create a user and a resource type and resource
      await prisma.user.deleteMany({});
      await prisma.resource.deleteMany({});
      await prisma.resourceType.deleteMany({});

      const user = await prisma.user.create({
        data: {
          name: 'TestUser',
          email: 'test@example.com',
          mobile: 1234567890,
          type: 'Internal',
          password: 'hashedpassword',
        },
      });
      userId = user.id;

      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;

      const resource = await prisma.resource.create({
        data: {
          name: 'TestResource',
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

    it('should block an order', async () => {
      const response = await request(app).post('/orders/blockOrder').send({
        userId,
        resourceId,
        bookingDate: '2023-10-10',
        timeSlot: TimeSlots.SLOT_10_12,
        resourceQty: 2,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Resource blocked successfully.'
      );

      // Verify the block was created in blockedOrders
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/orders/blockOrder').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('is required');
    });

    it('should return 400 if resource quantity is invalid', async () => {
      const response = await request(app).post('/orders/blockOrder').send({
        userId,
        resourceId,
        bookingDate: '2023-10-10',
        timeSlot: TimeSlots.SLOT_10_12,
        resourceQty: -1,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Resource quantity should be greater than 0.'
      );
    });

    it('should return 404 if resource not found', async () => {
      const response = await request(app).post('/orders/blockOrder').send({
        userId,
        resourceId: 99999,
        bookingDate: '2023-10-10',
        timeSlot: TimeSlots.SLOT_10_12,
        resourceQty: 2,
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource not found.');
    });

    it('should return 400 if time slot is invalid', async () => {
      const response = await request(app).post('/orders/blockOrder').send({
        userId,
        resourceId,
        bookingDate: '2023-10-10',
        timeSlot: 'INVALID',
        resourceQty: 2,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain(
        'Invalid time slot for the selected booking type.'
      );
    });
  });

  describe('POST /orders/confirmOrder', () => {
    let userId: number;
    let resourceId: number;
    let resourceTypeId: number;

    beforeAll(async () => {
      // Setup: Create a user and a resource type and resource
      await prisma.user.deleteMany({});
      await prisma.resource.deleteMany({});
      await prisma.resourceType.deleteMany({});

      const user = await prisma.user.create({
        data: {
          name: 'TestUser',
          email: 'test@example.com',
          mobile: 1234567890,
          type: 'Internal',
          password: 'hashedpassword',
        },
      });
      userId = user.id;

      const resourceType = await prisma.resourceType.create({
        data: { name: 'TestType' },
      });
      resourceTypeId = resourceType.id;

      const resource = await prisma.resource.create({
        data: {
          name: 'TestResource',
          resourceTypeId,
          maxQty: 10,
          priceInternal: 100,
          priceExternal: 150,
          bookingType: BookingType.TWO_HOUR,
          active: true,
        },
      });
      resourceId = resource.id;

      // Block an order for the user
      await request(app).post('/orders/blockOrder').send({
        userId,
        resourceId,
        bookingDate: '2023-10-10',
        timeSlot: TimeSlots.SLOT_10_12,
        resourceQty: 2,
      });
    });

    it('should confirm an order', async () => {
      const response = await request(app).post('/orders/confirmOrder').send({
        userId,
        resourceId,
        resourceQty: 2,
        bookingDate: '2023-10-10',
        amount: 200,
        bookingType: BookingType.TWO_HOUR,
        timeSlot: TimeSlots.SLOT_10_12,
        mode: 'online',
        transactionId: 'txn123',
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Order confirmed successfully.'
      );
      expect(response.body.order).toHaveProperty('id');

      // Verify the order was created in the database
      const order = await prisma.order.findUnique({
        where: { id: response.body.order.id },
      });
      expect(order).not.toBeNull();
      expect(order?.status).toBe('confirmed');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/orders/confirmOrder').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('is required');
    });

    it('should return 400 if booking type is invalid', async () => {
      const response = await request(app).post('/orders/confirmOrder').send({
        userId,
        resourceId,
        resourceQty: 2,
        bookingDate: '2023-10-10',
        amount: 200,
        bookingType: 'INVALID',
        timeSlot: TimeSlots.SLOT_10_12,
        mode: 'online',
        transactionId: 'txn123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid booking type.');
    });

    it('should return 400 if no block found for the given key', async () => {
      const response = await request(app).post('/orders/confirmOrder').send({
        userId,
        resourceId,
        resourceQty: 2,
        bookingDate: '2023-10-11',
        amount: 200,
        bookingType: BookingType.TWO_HOUR,
        timeSlot: TimeSlots.SLOT_10_12,
        mode: 'online',
        transactionId: 'txn123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No block found for the given key.');
    });

    it('should return 400 if no block found for the given user', async () => {
      const response = await request(app).post('/orders/confirmOrder').send({
        userId: 99999,
        resourceId,
        resourceQty: 2,
        bookingDate: '2023-10-10',
        amount: 200,
        bookingType: BookingType.TWO_HOUR,
        timeSlot: TimeSlots.SLOT_10_12,
        mode: 'online',
        transactionId: 'txn123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No block found for the given key.');
    });
  });
});
