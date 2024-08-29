import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getTimeSlots } from '../../shared/utils';
import { BookingType } from '../../shared/enums';

const prisma = new PrismaClient();
const blockedOrders: { [key: string]: { userId: string, resourceQty: number, timeout: NodeJS.Timeout }[] } = {};

// Function to generate blockKey
const generateBlockKey = (userId: string, resourceId: string, bookingDate: string, timeSlot: string) => {
  return `${resourceId}-${bookingDate}-${timeSlot}`;
};

/**
 * @swagger
 * /orders/blockOrder:
 *   post:
 *     summary: Block an order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - resourceId
 *               - bookingDate
 *               - timeSlot
 *               - resourceQty
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               resourceId:
 *                 type: string
 *                 description: The ID of the resource
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the booking
 *               timeSlot:
 *                 type: string
 *                 description: The time slot for the booking
 *               resourceQty:
 *                 type: number
 *                 description: The quantity of the resource being booked
 *     responses:
 *       200:
 *         description: Resource blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Missing required fields or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export const blockOrder = async (req: Request, res: Response) => {
  const { userId, resourceId, bookingDate, timeSlot, resourceQty } = req.body;

  try {
    // Validate request
    if (!userId || !resourceId || !bookingDate || !timeSlot || !resourceQty) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Fetch resource details
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Validate time slot
    const validTimeSlots = getTimeSlots(resource.bookingType as BookingType);
    if (!validTimeSlots.includes(timeSlot)) {
      return res.status(400).json(
        { error: 'Invalid time slot for the selected booking type.'
          + "valid slots are: " + validTimeSlots
         }
      );
    }

    // Check resource availability
    const existingOrders = await prisma.order.findMany({
      where: {
        resourceId,
        bookingDate: new Date(bookingDate),
        timeSlot,
      },
    });

    const totalBookedQty = existingOrders.reduce((total, order) => total + order.resourceQty, 0);

    const blockKey = generateBlockKey(userId, resourceId, bookingDate, timeSlot);
    const blockedQty = blockedOrders[blockKey]?.reduce((total, block) => total + block.resourceQty, 0) || 0;

    if (totalBookedQty + blockedQty + resourceQty > resource.maxQty) {
      return res.status(400).json(
        { error: 'Not enough availability for the selected time slot.' 
          + "alreadyBooked: " + totalBookedQty + ", blocked: " + blockedQty
          + "max: " + resource.maxQty
        }
      );
    }

    // Ensure the same user cannot hold more than one block
    if (blockedOrders[blockKey]?.some(block => block.userId === userId)) {
      return res.status(400).json({ error: 'User already has a block for the selected time slot.' });
    }

    // Block the resource
    const timeout = setTimeout(() => {
      blockedOrders[blockKey] = blockedOrders[blockKey].filter(block => block.userId !== userId);
      if (blockedOrders[blockKey].length === 0) {
        delete blockedOrders[blockKey];
      }
    }, 5 * 60 * 1000); // 5 minutes timeout

    if (!blockedOrders[blockKey]) {
      blockedOrders[blockKey] = [];
    }

    blockedOrders[blockKey].push({ userId, resourceQty, timeout });

    res.status(200).json({ message: 'Resource blocked successfully.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /orders/confirmOrder:
 *   post:
 *     summary: Confirm an order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - resourceId
 *               - resourceQty
 *               - bookingDate
 *               - amount
 *               - bookingType
 *               - timeSlot
 *               - mode
 *               - transactionId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               resourceId:
 *                 type: string
 *                 description: The ID of the resource
 *               resourceQty:
 *                 type: number
 *                 description: The quantity of the resource being booked
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the booking
 *               amount:
 *                 type: number
 *                 description: The amount for the booking
 *               bookingType:
 *                 type: string
 *                 description: The type of booking
 *               timeSlot:
 *                 type: string
 *                 description: The time slot for the booking
 *               mode:
 *                 type: string
 *                 description: The mode of payment
 *               transactionId:
 *                 type: string
 *                 description: The transaction ID
 *     responses:
 *       200:
 *         description: Order confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 order:
 *                   type: object
 *                   description: The confirmed order details
 *       400:
 *         description: Missing required fields or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { userId, resourceId, resourceQty, bookingDate, amount, bookingType, timeSlot, mode, transactionId } = req.body;
    const blockKey = generateBlockKey(userId, resourceId, bookingDate, timeSlot);

    if (!blockedOrders[blockKey]) {
      return res.status(400).json({ error: 'No block found for the given key.' });
    }

    const blockIndex = blockedOrders[blockKey].findIndex(block => block.userId === userId);
    if (blockIndex === -1) {
      return res.status(400).json({ error: 'No block found for the given user.' });
    }

    // Confirm the order and save to the database
    const order = await prisma.order.create({
      data: {
        mode,
        transactionId,
        bookingDate: new Date(bookingDate),
        amount,
        resourceId,
        resourceQty,
        bookingType,
        timeSlot,
        timestamp: new Date(),
        userId,
        status: 'confirmed',
      },
    });

    // Remove the block for the specific user
    blockedOrders[blockKey].splice(blockIndex, 1);
    if (blockedOrders[blockKey].length === 0) {
      delete blockedOrders[blockKey];
    }

    res.status(200).json({ message: 'Order confirmed successfully.', order });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};