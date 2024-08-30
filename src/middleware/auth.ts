import { expressjwt } from 'express-jwt';

const secret = process.env.JWT_SECRET || 'agiledatalabs';

export const authenticateToken = expressjwt({
  secret: secret,
  algorithms: ['HS256'],
  requestProperty: 'user', // This will add the decoded token to req.user
});
