import { body, param, query } from 'express-validator';
import { CareType, RecurrenceUnit } from '../types/enums';

export const careTaskBodyRules = [
  body('plant').isMongoId().withMessage('Please choose a plant'),
  body('type').isIn(Object.values(CareType)).withMessage('Care type must be watering, fertilizing or pruning'),
  // Title is optional: when it is empty the API builds one, e.g. "Water Kitchen Monstera"
  body('title')
    .optional({ values: 'falsy' })
    .isString().withMessage('Title must be text')
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('notes')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date and time')
    .toDate(),
  body('recurrence.unit')
    .optional()
    .isIn(Object.values(RecurrenceUnit)).withMessage('Repeat must be none, daily, weekly or monthly'),
  body('recurrence.interval')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Repeat interval must be between 1 and 365')
    .toInt(),
];

export const careTaskIdRule = [param('id').isMongoId().withMessage('Invalid task id')];

export const TASK_VIEWS = ['upcoming', 'overdue', 'pending', 'completed', 'all'] as const;

export const careTaskListRules = [
  query('view').optional().isIn([...TASK_VIEWS]).withMessage('Invalid view'),
  query('type').optional().isIn(Object.values(CareType)).withMessage('Invalid care type filter'),
  query('plant').optional().isMongoId().withMessage('Invalid plant filter'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
];
