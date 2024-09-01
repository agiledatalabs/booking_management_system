import { NextFunction, Response, Request } from 'express';

export const setUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userHeader = req.headers['user'];
  if (userHeader) {
    req.user = JSON.parse(userHeader as string);
  }
  next();
};
