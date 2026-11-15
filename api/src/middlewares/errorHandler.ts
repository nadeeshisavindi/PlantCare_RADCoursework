import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

interface MongoDuplicateError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

const isDuplicateKeyError = (err: unknown): err is MongoDuplicateError =>
  err instanceof Error && (err as MongoDuplicateError).code === 11000;





export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value';
    message = `${field} already exists`;
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Token expired';
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON body';
  }

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
    if (env.isProduction) message = 'Internal server error';
    else if (err instanceof Error) message = err.message;
  }

  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
};
