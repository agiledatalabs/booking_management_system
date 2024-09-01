import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { validateRequiredFields } from '@/shared/utils';
import { BookingType } from '@/shared/enums';

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
 *       409:
 *         description: Conflict
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
    const requiredFields = [
      'name',
      'resourceTypeId',
      'priceInternal',
      'priceExternal',
      'bookingType',
    ];
    const validationError = validateRequiredFields(req.body, requiredFields);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const {
      name,
      resourceTypeId,
      maxQty,
      priceInternal,
      priceExternal,
      bookingType,
      active,
    } = req.body;

    // Validate bookingType
    if (!Object.values(BookingType).includes(bookingType)) {
      return res.status(400).json({
        error:
          'Invalid bookingType. Choose one of: ' + Object.values(BookingType),
      });
    }

    const newResource = await prisma.resource.create({
      data: {
        name,
        resourceTypeId,
        maxQty,
        priceInternal,
        priceExternal,
        bookingType,
        active,
      },
    });

    res.status(201).json(newResource);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Resource already exists' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({
          error:
            'Invalid resourceTypeId. The specified resource type does not exist.',
        });
      }
    }
    res.status(500).json({ error: (error as Error).message });
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
 *       400:
 *         description: Bad request
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

  // Validate resourceTypeId
  if (
    resourceTypeId == null ||
    typeof resourceTypeId !== 'string' ||
    resourceTypeId.trim() === ''
  ) {
    return res.status(400).json({ error: 'resourceTypeId cannot be blank' });
  }

  try {
    const resource = await prisma.resource.findMany({
      where: { resourceTypeId: Number(resourceTypeId) },
    });

    if (!resourceTypeId || resourceTypeId === '') {
      return res.status(400).json({ error: 'resourceTypeId is required' });
    }

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(400)
          .json({ error: 'Argument `resourceTypeId` is missing or invalid.' });
      }
    } else {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Edit a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the resource to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The resource name
 *               resourceTypeId:
 *                 type: integer
 *                 description: The resource type ID
 *               maxQty:
 *                 type: integer
 *                 description: The maximum quantity
 *               priceInternal:
 *                 type: number
 *                 description: The internal price
 *               priceExternal:
 *                 type: number
 *                 description: The external price
 *               bookingType:
 *                 type: string
 *                 description: The booking type
 *               active:
 *                 type: boolean
 *                 description: Whether the resource is active
 *     responses:
 *       200:
 *         description: The updated resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The resource ID
 *                 name:
 *                   type: string
 *                   description: The resource name
 *                 resourceTypeId:
 *                   type: integer
 *                   description: The resource type ID
 *                 maxQty:
 *                   type: integer
 *                   description: The maximum quantity
 *                 priceInternal:
 *                   type: number
 *                   description: The internal price
 *                 priceExternal:
 *                   type: number
 *                   description: The external price
 *                 bookingType:
 *                   type: string
 *                   description: The booking type
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
 */

export const editResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    resourceTypeId,
    maxQty,
    priceInternal,
    priceExternal,
    bookingType,
    active,
  } = req.body;

  if (
    !name &&
    !resourceTypeId &&
    !maxQty &&
    !priceInternal &&
    !priceExternal &&
    !bookingType &&
    active === undefined
  ) {
    return res.status(400).json({
      error: 'At least one field is required to update the resource.',
    });
  }

  try {
    const data: Prisma.ResourceUpdateInput = {};

    if (name !== undefined) data.name = name;
    if (resourceTypeId !== undefined)
      data.resourceType = { connect: { id: Number(resourceTypeId) } };
    if (maxQty !== undefined) data.maxQty = Number(maxQty);
    if (priceInternal !== undefined) data.priceInternal = Number(priceInternal);
    if (priceExternal !== undefined) data.priceExternal = Number(priceExternal);
    if (bookingType !== undefined) data.bookingType = bookingType;
    if (active !== undefined) data.active = Boolean(active);

    const updatedResource = await prisma.resource.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(updatedResource);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Resource not found.' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/resources/{id}/status:
 *   put:
 *     summary: Update the status of a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the resource to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *                 description: The new status of the resource
 *     responses:
 *       200:
 *         description: The updated resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The resource ID
 *                 name:
 *                   type: string
 *                   description: The resource name
 *                 resourceTypeId:
 *                   type: integer
 *                   description: The resource type ID
 *                 maxQty:
 *                   type: integer
 *                   description: The maximum quantity
 *                 priceInternal:
 *                   type: number
 *                   description: The internal price
 *                 priceExternal:
 *                   type: number
 *                   description: The external price
 *                 bookingType:
 *                   type: string
 *                   description: The booking type
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
 */
export const updateResourceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { active } = req.body;

  if (active === undefined) {
    return res.status(400).json({ error: 'Active status is required.' });
  }

  try {
    const updatedResource = await prisma.resource.update({
      where: { id: Number(id) },
      data: { active: Boolean(active) },
    });

    res.status(200).json(updatedResource);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Resource not found.' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     description: Deletes a resource by its ID.
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The resource ID
 *     responses:
 *       204:
 *         description: Resource deleted successfully
 *       400:
 *         description: Invalid resource ID
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
export const deleteResource = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resourceId = parseInt(id, 10);

    if (isNaN(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete does not exist
        return res.status(404).json({ error: 'Resource not found' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};
