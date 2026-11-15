import { body, param, query } from 'express-validator';
import { LightRequirement } from '../types/enums';


export const plantBodyRules = [
  body('name')
    .isString().withMessage('Plant name is required')
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Plant name must be 2-80 characters'),
  body('species')
    .isString().withMessage('Species is required')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Species is required (max 100 characters)'),
  body('plantingDate')
    .notEmpty().withMessage('Planting date is required')
    .isISO8601().withMessage('Planting date must be a valid date')
    .toDate()
    .custom((value: Date) => value.getTime() <= Date.now() + 24 * 60 * 60 * 1000)
    .withMessage('Planting date cannot be in the future'),
  body('imageUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid http(s) URL'),
  body('description')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('location')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('careInfo.light')
    .optional()
    .isIn(Object.values(LightRequirement)).withMessage('Light must be low, medium or high'),
  body('careInfo.wateringTips')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('Watering tips cannot exceed 500 characters'),
  body('careInfo.fertilizerTips')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('Fertilizer tips cannot exceed 500 characters'),
  body('careInfo.pruningTips')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('Pruning tips cannot exceed 500 characters'),
  body('careInfo.notes')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

export const plantIdRule = [param('id').isMongoId().withMessage('Invalid plant id')];

export const plantListRules = [
  query('q').optional().isString().trim().isLength({ max: 100 }).withMessage('Search text is too long'),
  query('light').optional().isIn(Object.values(LightRequirement)).withMessage('Invalid light filter'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'name', 'planted'])
    .withMessage('Invalid sort option'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
];
