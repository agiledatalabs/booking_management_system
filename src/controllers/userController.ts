import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

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