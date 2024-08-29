import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

