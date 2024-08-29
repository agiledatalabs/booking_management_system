import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     ResourceType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the resource type
 *         name:
 *           type: string
 *           description: The name of the resource type
 */

/**
 * @swagger
 * /resource-types:
 *   get:
 *     summary: Get all resource types
 *     tags: [ResourceTypes]
 *     responses:
 *       200:
 *         description: The list of resource types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResourceType'
 *       400:
 *         description: Some error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export const getResourceTypes = async (req: Request, res: Response) => {
  try {
    const resourceTypes = await prisma.resourceType.findMany();
    res.status(200).json(resourceTypes);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /resource-types:
 *   post:
 *     summary: Add a new resource type
 *     tags: [ResourceTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the resource type
 *     responses:
 *       201:
 *         description: The created resource type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceType'
 *       400:
 *         description: Some error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export const addResourceType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newResourceType = await prisma.resourceType.create({
      data: { name },
    });
    res.status(201).json(newResourceType);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

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
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The auto-generated id of the resource
 *                 name:
 *                   type: string
 *                   description: The name of the resource
 *                 resourceTypeId:
 *                   type: integer
 *                   description: The ID of the resource type
 *                 maxQty:
 *                   type: integer
 *                   description: The maximum quantity of the resource
 *                 priceInternal:
 *                   type: number
 *                   description: The internal price of the resource
 *                 priceExternal:
 *                   type: number
 *                   description: The external price of the resource
 *                 bookingType:
 *                   type: string
 *                   description: The type of booking
 *                 active:
 *                   type: boolean
 *                   description: Whether the resource is active
 *       400:
 *         description: Some error occurred
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