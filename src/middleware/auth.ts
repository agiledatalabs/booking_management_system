import { Request, Response, NextFunction } from 'express';
import { UserTypes } from '@/shared/enums'; // Adjust the import path as necessary
import { expressjwt } from 'express-jwt';

const secret = process.env.JWT_SECRET || 'agiledatalabs';

export const authenticateToken = expressjwt({
  secret: secret,
  algorithms: ['HS256'],
  requestProperty: 'user', // This will add the decoded token to req.user
});

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as { id: number; type: string }; // Adjust the type as necessary

  if (user.type !== UserTypes.ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
