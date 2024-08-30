import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secretKey = process.env.SECRET_KEY || 'agiledatalabs'; // Use a secure key and store it in environment variables

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               mobile:
 *                 type: string
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 example: password123
 *               type:
 *                 type: string
 *                 example: user
 *             required:
 *               - name
 *               - email
 *               - mobile
 *               - password
 *               - type
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User registered
 *       400:
 *         description: Bad request, missing or empty fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required and must not be empty
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error hashing password
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, mobile, password, type } = req.body;
  // Check if any field is blank
  if (!name || !email || !mobile || !password || !type || name.trim() === '' || email.trim() === '' || password.trim() === '' || type.trim() === '') {
    return res.status(400).json({ error: 'All fields are required and must not be empty' });
  }

  let hashedPassword: string;
  try {
    // Hash the password
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    return res.status(500).json({ error: 'Error hashing password' });
  }

  try {
    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile: parseInt(mobile, 10), // Ensure mobile is an integer
        password: hashedPassword,
        type,
      },
    });

    res.status(201).send('User registered');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Email or mobile already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    } else {
      // Handle other errors
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request, missing or empty fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email and password are required and must not be empty
 *       401:
 *         description: Unauthorized, invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if email or password is blank or an empty string
  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({ error: 'Email and password are required and must not be empty' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, type: user.type }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({ error: 'Database error occurred' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(500).json({ error: 'Error generating token' });
    } else {
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};
