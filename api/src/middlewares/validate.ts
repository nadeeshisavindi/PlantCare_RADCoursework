import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';



export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const errors = result.array().map((e) => ({
    field: e.type === 'field' ? e.path : e.type,
    message: String(e.msg),
  }));
  throw new AppError('Validation failed', 400, errors);
};
