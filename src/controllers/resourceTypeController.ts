import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getResourceTypes = async (req: Request, res: Response) => {
  try {
    const resourceTypes = await prisma.resourceType.findMany();
    res.status(200).json(resourceTypes);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

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