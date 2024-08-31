import { Request, Response } from 'express';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { UserTypes } from '@/shared/enums';

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
 *           description: The type of the recipient (e.g., 'admin')
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
 * /api/sendMessage:
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
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the message
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

    // Validate input
    if (text === null || text === '' || text === undefined) {
      return res.status(400).json({
        error: 'Text is required and cannot be null, empty, or undefined.',
      });
    }

    const message = await prisma.message.create({
      data: {
        text,
        sentBy,
        recepientType: 'user',
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /messages/getMessages:
 *   get:
 *     summary: Get messages for current user
 *     tags: [Messages]
 *     parameters:
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
        OR: [{ sentBy: Number(userId) }, { sentTo: Number(userId) }],
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        reciever: {
          select: {
            name: true,
          },
        },
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
 * /api/message/markRead/{messageId}:
 *   put:
 *     summary: Mark a message as read
 *     description: Marks a message as read by updating the readByReciever field to true.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     readByReciever:
 *                       type: boolean
 *                       example: true
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database error
 */
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    // Update the message in the database
    const updatedMessage = await prisma.message.update({
      where: { id: Number(messageId) },
      data: { readByReciever: true },
    });

    res
      .status(200)
      .json({ message: 'Message marked as read', data: updatedMessage });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // Record not found
      res.status(404).json({ error: 'Message not found' });
    } else {
      // Other errors
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

/**
 * @swagger
 * admin/messages/reply:
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
 *               - sentTo
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the reply
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

    // Validate input
    if (!text || text.trim() === '' || sentTo == null || sentTo == undefined) {
      return res.status(400).json({
        error:
          'Text is required and cannot be null, empty, or undefined. Recipient ID must be a valid number.',
      });
    }

    const message = await prisma.message.create({
      data: {
        text,
        sentBy,
        sentTo,
      },
    });

    res.status(201).json(message);
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
          recepientType: UserTypes.ADMIN,
          readByReciever: false,
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
          reciever: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.message.count({
        where: {
          recepientType: UserTypes.ADMIN,
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
 * /admin/messages/getMessages/{userId}:
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

    const conversation = await prisma.message.findMany({
      where: {
        OR: [{ sentBy: Number(userId) }, { sentTo: Number(userId) }],
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        reciever: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limit,
    });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
