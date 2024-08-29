import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const replyMessage = async (req: Request, res: Response) => {
  try {
    const { text, sentBy, sentTo } = req.body;

    const reply = await prisma.message.create({
      data: {
        text,
        sentBy,
        sentTo,
        recepientType: 'User',
      },
    });

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

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
