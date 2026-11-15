import { body } from 'express-validator';

export const registerRules = [
  body('name')
    .isString().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters')
    .escape(),
  body('email')
    .isString().withMessage('Email is required')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password is required')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
];

export const loginRules = [
  body('email')
    .isString().withMessage('Email is required')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];
