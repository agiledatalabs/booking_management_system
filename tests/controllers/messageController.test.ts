import request from 'supertest';
import express from 'express';
import { PrismaClient, User } from '@prisma/client';
import {
  sendMessage,
  adminReplyMessage,
  getMessages,
  getAdminUnreadMessages,
  getUserMessages,
  markMessageAsRead,
} from '@/controllers/messageController';
import { users, user_messages, admin_messages } from '../fixtures';
import jwt from 'jsonwebtoken';
import { authenticateToken, checkAdmin } from '@/middleware/auth';
import { setUserMiddleware } from '../utils/middleware';
const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(setUserMiddleware);
// app.use(authenticateToken);
app.use('/admin', checkAdmin);
app.post('/api/sendMessage', sendMessage);
app.post('/admin/messages/reply', adminReplyMessage);
app.get('/messages', getMessages);
app.get('/admin/messages/getUnread', getAdminUnreadMessages);
app.get('/admin/messages/getMessages/:userId', getUserMessages);
app.put('/api/message/markRead/:messageId', markMessageAsRead);

const secret = process.env.JWT_SECRET || 'agiledatalabs';

const generateToken = (user: Partial<User>) => {
  return jwt.sign({ id: user.id, type: user.type }, secret, {
    expiresIn: '1h',
  });
};

describe('Message Controller', () => {
  beforeAll(async () => {
    // Setup: Clear the database or create necessary test data
    await prisma.message.deleteMany({});
    await prisma.user.deleteMany({});

    // Reset the autoincrement ID for the user table
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;

    // Create test users
    await prisma.user.createMany({
      data: users,
    });

    // Create test messages
    await prisma.message.createMany({
      data: [...user_messages, ...admin_messages],
    });
  });

  afterAll(async () => {
    // Cleanup: Close the Prisma Client connection
    await prisma.message.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/sendMessage', () => {
    it('should create a new message', async () => {
      const response = await request(app)
        .post('/api/sendMessage')
        .set('user', JSON.stringify({ id: 2, type: 'external' }))
        .send({ text: 'New Message' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('text', 'New Message');

      // Verify the message was created in the database
      const message = await prisma.message.findUnique({
        where: { id: response.body.id },
      });
      expect(message).not.toBeNull();
      expect(message?.text).toBe('New Message');
    });

    it('should return 500 if text is missing', async () => {
      const response = await request(app)
        .post('/api/sendMessage')
        .set('user', JSON.stringify({ id: 2, type: 'external' }))
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Text is required and cannot be null, empty, or undefined.'
      );
    });
  });

  describe('POST /admin/messages/reply', () => {
    it('should create a reply message with admin authorization', async () => {
      const response = await request(app)
        .post('/admin/messages/reply')
        .set('user', JSON.stringify({ id: 1, type: 'admin' }))
        .send({ text: 'Reply Message', sentTo: 2 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('text', 'Reply Message');

      // Verify the message was created in the database
      const message = await prisma.message.findUnique({
        where: { id: response.body.id },
      });
      expect(message).not.toBeNull();
      expect(message?.text).toBe('Reply Message');
    });

    it('should return 403 if user is not an admin', async () => {
      const response = await request(app)
        .post('/admin/messages/reply')
        .set('user', JSON.stringify({ id: 2, type: 'external' }))
        .send({ text: 'Reply Message', sentTo: 2 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('should return 400 if text or sentTo is missing', async () => {
      const response = await request(app)
        .post('/admin/messages/reply')
        .set('user', JSON.stringify({ id: 1, type: 'admin' }))
        .send({ text: 'Reply Message' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Text is required and cannot be null, empty, or undefined. Recipient ID must be a valid number.'
      );
    });
  });

  describe('GET /messages', () => {
    it('should return a list of messages for the current user', async () => {
      const response = await request(app)
        .get('/messages')
        .set('user', JSON.stringify({ id: 2, type: 'external' }));

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('text');
    });
  });

  describe('GET /admin/messages/getUnread', () => {
    it('should return a list of unread messages for admin', async () => {
      const response = await request(app)
        .get('/admin/messages/getUnread')
        .set('user', JSON.stringify({ id: 1, type: 'admin' }));

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('text');
    });
  });

  describe('GET /admin/messages/getMessages/:userId', () => {
    it('should return a list of messages for a specific user', async () => {
      const response = await request(app)
        .get('/admin/messages/getMessages/2')
        .set('user', JSON.stringify({ id: 1, type: 'admin' }));

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('text');
    });
  });

  describe('PUT /api/message/markRead/:messageId', () => {
    it('should mark a message as read', async () => {
      const message = await prisma.message.create({
        data: { text: 'Mark as Read', sentBy: 2, sentTo: 3 },
      });

      const response = await request(app)
        .put(`/api/message/markRead/${message.id}`)
        .set('user', JSON.stringify({ id: 2, type: 'external' }));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Message marked as read');

      // Verify the message was updated in the database
      const updatedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });
      expect(updatedMessage?.readByReciever).toBe(true);
    });

    it('should return 404 if messageId is invalid', async () => {
      const response = await request(app)
        .put('/api/message/markRead/99999')
        .set('user', JSON.stringify({ id: 2, type: 'external' }));

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Message not found');
    });
  });
});
