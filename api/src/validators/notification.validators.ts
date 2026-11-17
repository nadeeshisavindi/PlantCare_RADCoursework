import { param, query } from 'express-validator';

export const notificationListRules = [
  query('unread').optional().isIn(['true', 'false']).withMessage('unread must be true or false'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
];

export const notificationIdRule = [param('id').isMongoId().withMessage('Invalid notification id')];
