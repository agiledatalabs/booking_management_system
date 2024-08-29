import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - text
 *         - sentBy
 *         - sentTo
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the message
 *         text:
 *           type: string
 *           description: The content of the message
 *         sentBy:
 *           type: integer
 *           description: The ID of the user who sent the message
 *         recepientType:
 *           type: string
 *           description: The type of the recipient (e.g., 'Admin', 'User')
 *         sentTo:
 *           type: integer
 *           description: The ID of the user who received the message
 *         readByReciever:
 *           type: boolean
 *           description: Whether the message has been read by the receiver
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The time the message was sent
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - sentBy
 *               - sentTo
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the message
 *               sentBy:
 *                 type: integer
 *                 description: The ID of the user who is sending the message
 *               sentTo:
 *                 type: integer
 *                 description: The ID of the user who will receive the message
 *     responses:
 *       201:
 *         description: The created message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Some server error
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text, sentBy, sentTo } = req.body;

    const message = await prisma.message.create({
      data: {
        text,
        sentBy,
        sentTo,
        recepientType: 'Admin',
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /messages/reply:
 *   post:
 *     summary: Reply to a message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - sentBy
 *               - sentTo
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the reply
 *               sentBy:
 *                 type: integer
 *                 description: The ID of the user who is sending the reply
 *               sentTo:
 *                 type: integer
 *                 description: The ID of the user who will receive the reply
 *     responses:
 *       201:
 *         description: The created reply message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Some server error
 */
export const replyMessage = async (req: Request, res: Response) => {
  try {
    const { text, sentBy, sentTo } = req.body;

    const message = await prisma.message.create({
      data: {
        text,
        sentBy,
        sentTo,
        recepientType: 'User',
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /messages/user/{userId}:
 *   get:
 *     summary: Get messages for a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of messages per page
 *     responses:
 *       200:
 *         description: The list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Some server error
 */
export const getUserMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sentBy: Number(userId) },
          { sentTo: Number(userId) },
        ],
      },
      include: {
        sender: true,
        reciever: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limit,
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /messages/admin/unread:
 *   get:
 *     summary: Get unread messages for admin
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: The list of unread messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Some server error
 */
export const getAdminUnreadMessages = async (req: Request, res: Response) => {
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        recepientType: 'Admin',
        readByReciever: false,
      },
      include: {
        sender: true,
        reciever: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    res.status(200).json(unreadMessages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /messages/conversation/{userId}:
 *   get:
 *     summary: Get conversation for a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of messages per page
 *     responses:
 *       200:
 *         description: The list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Some server error
 */
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const conversation = await prisma.message.findMany({
      where: {
        OR: [
          { sentBy: Number(userId) },
          { sentTo: Number(userId) },
        ],
      },
      include: {
        sender: true,
        reciever: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
      skip,
      take: limit,
    });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};