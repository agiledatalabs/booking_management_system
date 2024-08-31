import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

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
 * /resourceTypes:
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
 * /resourceTypes:
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

    // Check for blank or null input
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required and must not be empty' });
    }

    // Basic sanity check: Ensure name is a string and has a reasonable length
    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ error: 'Name must be between 3 and 50 characters long' });
    }

    const newResourceType = await prisma.resourceType.create({
      data: { name },
    });
    res.status(201).json(newResourceType);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Unique constraint violation
      res.status(400).json({ error: 'A resource type with this name already exists' });
    } else {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

/**
 * @swagger
 * /api/resourceTypes/{id}:
 *   delete:
 *     summary: Delete a resource type
 *     tags: [ResourceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the resource type to delete
 *       - in: query
 *         name: forceDelete
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Cascade delete resource associated with this ResourceType

 *     responses:
 *       200:
 *         description: Resource type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Resource type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
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
export const deleteResourceType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { forceDelete } = req.query
  try {
    if (forceDelete === 'true') {
      // Delete associated resources first
      await prisma.resource.deleteMany({
        where: { resourceTypeId: Number(id) },
      });
    }
    await prisma.resourceType.delete({
      where: { id: Number(id) },
    });
    res.status(204).json(null);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Resource type not found.' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Cannot delete resource type as it is associated with existing resources.' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/resourceTypes/{id}:
 *   put:
 *     summary: Edit a resource type
 *     tags: [ResourceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the resource type to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The resource type name
 *     responses:
 *       200:
 *         description: The updated resource type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The resource type ID
 *                 name:
 *                   type: string
 *                   description: The resource type name
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
 *         description: Resource type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export const editResourceType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  // Check for blank or null input
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required and must not be empty' });
  }

  // Basic sanity check: Ensure name is a string and has a reasonable length
  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({ error: 'Name must be between 3 and 50 characters long' });
  }

  try {
    const updatedResourceType = await prisma.resourceType.update({
      where: { id: Number(id) },
      data: { name },
    });

    res.status(200).json(updatedResourceType);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Resource type not found.' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};