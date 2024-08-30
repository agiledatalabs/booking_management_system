import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';

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
    const { text } = req.body;
    const sentBy = (req.user as User).id;

    const message = await prisma.message.create({
      data: {
        text,
        sentBy,
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
export const adminReplyMessage = async (req: Request, res: Response) => {
  try {
    const { text, sentTo } = req.body;
    const sentBy = (req.user as User).id;

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
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;
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
 * /admin/messages/getUnread:
 *   get:
 *     summary: Get unread messages for admin with pagination
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of unread messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalMessages:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       500:
 *         description: Some server error
 */
export const getAdminUnreadMessages = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [unreadMessages, totalMessages] = await Promise.all([
      prisma.message.findMany({
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
        skip: offset,
        take: limit,
      }),
      prisma.message.count({
        where: {
          recepientType: 'Admin',
          readByReciever: false,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalMessages / limit);

    res.status(200).json({
      data: unreadMessages,
      meta: {
        totalMessages,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
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
export const getUserMessages = async (req: Request, res: Response) => {
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