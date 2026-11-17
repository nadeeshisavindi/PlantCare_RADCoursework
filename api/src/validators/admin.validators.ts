import { body, param, query } from 'express-validator';
import { UserRole } from '../types/enums';

export const adminUserListRules = [
  query('q').optional().isString().isLength({ max: 100 }).withMessage('Search is too long'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
];

export const adminUserIdRule = [param('id').isMongoId().withMessage('Invalid user id')];

export const adminRoleRules = [
  body('role').isIn(Object.values(UserRole)).withMessage('Role must be user or admin'),
];
