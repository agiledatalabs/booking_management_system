import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secretKey = process.env.SECRET_KEY || 'agiledatalabs'; // Use a secure key and store it in environment variables

// User registration
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
        mobile,
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


// User login
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

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
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
