import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]:', err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const zodErr = err as any;
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: zodErr.errors.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Define custom error shape if needed, otherwise generic 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
