import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       required:
 *         - name
 *         - resourceTypeId
 *         - maxQty
 *         - priceInternal
 *         - priceExternal
 *         - bookingType
 *         - active
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the resource
 *         name:
 *           type: string
 *           description: The name of the resource
 *         resourceTypeId:
 *           type: integer
 *           description: The ID of the resource type
 *         maxQty:
 *           type: integer
 *           description: The maximum quantity of the resource
 *         priceInternal:
 *           type: number
 *           description: The internal price of the resource
 *         priceExternal:
 *           type: number
 *           description: The external price of the resource
 *         bookingType:
 *           type: string
 *           description: The type of booking
 *         active:
 *           type: boolean
 *           description: Whether the resource is active
 */

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Add a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - resourceTypeId
 *               - maxQty
 *               - priceInternal
 *               - priceExternal
 *               - bookingType
 *               - active
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the resource
 *               resourceTypeId:
 *                 type: integer
 *                 description: The ID of the resource type
 *               maxQty:
 *                 type: integer
 *                 description: The maximum quantity of the resource
 *               priceInternal:
 *                 type: number
 *                 description: The internal price of the resource
 *               priceExternal:
 *                 type: number
 *                 description: The external price of the resource
 *               bookingType:
 *                 type: string
 *                 description: The type of booking
 *               active:
 *                 type: boolean
 *                 description: Whether the resource is active
 *     responses:
 *       201:
 *         description: The created resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
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
export const addResource = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const { name, resourceTypeId, maxQty, priceInternal, priceExternal, bookingType, active } = req.body;
    // console.log(price_external, priceInternal);
    const newResource = await prisma.resource.create({
      data: {
        name,
        resourceTypeId,
        maxQty,
        priceInternal,
        priceExternal,
        bookingType,
        active,
        // resourceType: {
        //   connect: { id: resourceTypeId },
        // },
      },
    });
    res.status(201).json(newResource);
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get resources by resource type ID
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: resourceTypeId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the resource type
 *     responses:
 *       200:
 *         description: The list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
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
export const getResources = async (req: Request, res: Response) => {
  const { resourceTypeId } = req.query;

  try {
    const resource = await prisma.resource.findMany({
      where: { resourceTypeId: Number(resourceTypeId) },
    });

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

