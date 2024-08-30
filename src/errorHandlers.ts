import { Request, Response, NextFunction } from 'express';
import path from 'path';

// 404 Error Handler for API Routes
export const apiErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "API doesn't exist, check docs" });
};

// 404 Error Handler for Non-API Routes
export const uiErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).sendFile(path.join(__dirname, 'build/404.html'));
};

// General Error Handler
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (req.path.startsWith('/api')) {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).sendFile(path.join(__dirname, 'build/500.html'));
  }
};