const { body, validationResult } = require('express-validator');

// Generic helper to run validation chains and return formatted errors
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Return the first error for each field
    const formattedErrors = errors.array().reduce((acc, err) => {
      const field = err.path;
      if (!acc[field]) {
        acc[field] = err.msg;
      }
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the fields below.',
      errors: formattedErrors,
    });
  };
};

const registerValidation = validate([
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain letters and spaces only'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]);

const loginValidation = validate([
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
]);

const expenseValidation = validate([
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a number greater than 0'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
    .escape(),
  body('date')
    .optional()
    .isISO8601().withMessage('Please enter a valid date (YYYY-MM-DD)'),
]);

const budgetValidation = validate([
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .escape(),
  body('limit')
    .isFloat({ min: 0 }).withMessage('Budget limit must be a number greater than or equal to 0'),
  body('month')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100'),
]);

module.exports = {
  registerValidation,
  loginValidation,
  expenseValidation,
  budgetValidation,
};
// Note: We escape strings to prevent XSS injection issues when storing and displaying values.
