import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - mobile
 *         - type
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         mobile:
 *           type: string
 *           description: The mobile number of the user
 *         type:
 *           type: string
 *           description: The type of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         active:
 *           type: boolean
 *           description: Whether the user is active
 */

/**
 * @swagger
 * /createUser:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - mobile
 *               - type
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               mobile:
 *                 type: string
 *                 description: The mobile number of the user
 *               type:
 *                 type: string
 *                 description: The type of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Unique constraint failed
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
const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, type, password } = req.body;

    // Directly store the encrypted password
    const encryptedPassword = password;

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        type,
        password: encryptedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('email')) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
        if (target.includes('mobile')) {
          return res.status(400).json({ error: 'Mobile number already exists.' });
        }
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /deactivateUser/{id}:
 *   put:
 *     summary: Deactivate a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the user to deactivate
 *     responses:
 *       200:
 *         description: The deactivated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
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
const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mark the user as inactive in the database
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { active: false },
    });

    res.status(200).json({ message: 'User deactivated successfully.', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record not found
        return res.status(404).json({ error: 'User not found.' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/editUser/{id}:
 *   put:
 *     summary: Edit a user's email or mobile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the user to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The new email of the user
 *               mobile:
 *                 type: string
 *                 description: The new mobile number of the user
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       400:
 *         description: Unique constraint failed
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
const editUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, mobile } = req.body;

    // Prepare the data object with only the fields that are provided
    const data: { email?: string; mobile?: number } = {};
    if (email) data.email = email;
    if (mobile) data.mobile = mobile;

    // Update the user's email and/or mobile in the database
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json({ message: 'User updated successfully.', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record not found
        return res.status(404).json({ error: 'User not found.' });
      }
      if (error.code === 'P2002') {
        // Unique constraint failed
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('email')) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
        if (target.includes('mobile')) {
          return res.status(400).json({ error: 'Mobile number already exists.' });
        }
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/updatePassword/{id}:
 *   put:
 *     summary: Update a user's password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The id of the user to update the password for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password of the user
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
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
const updatePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Directly store the encrypted password
    const encryptedPassword = password;

    // Update the user's password in the database
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { password: encryptedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully.', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record not found
        return res.status(404).json({ error: 'User not found.' });
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
};

export {
  createUser,
  deactivateUser,
  editUser,
  updatePassword,
};