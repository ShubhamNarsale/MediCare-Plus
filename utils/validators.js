// utils/validators.js
// Reusable express-validator validation chains.
// Field limits mirror the column definitions in database/schema.sql
// so validation errors surface before a query would fail anyway.

const { body, validationResult } = require('express-validator');

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .isLength({ max: 150 }).withMessage('Email must be under 150 characters')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('Phone number is too long')
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Enter a valid phone number')
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// ------------------------------------------------------------
// Appointments
// ------------------------------------------------------------

const bookAppointmentValidation = [
  body('doctor_id').notEmpty().withMessage('Please select a doctor').isInt({ min: 1 }).withMessage('Invalid doctor selected'),
  body('appointment_date')
    .notEmpty().withMessage('Please select a date')
    .isDate().withMessage('Enter a valid date')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(value);
      if (chosen < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  body('appointment_time').notEmpty().withMessage('Please select a time slot'),
  body('reason').optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage('Reason must be under 255 characters')
];

// ------------------------------------------------------------
// Products / Cart
// ------------------------------------------------------------

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 100 }),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').notEmpty().withMessage('Stock is required').isInt({ min: 0 }).withMessage('Stock cannot be negative')
];

const cartQuantityValidation = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive number')
];

// ------------------------------------------------------------
// Checkout
// ------------------------------------------------------------

const checkoutValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Enter a valid phone number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .matches(/^[0-9]{4,10}$/).withMessage('Enter a valid pincode'),
  body('paymentMethod')
    .notEmpty().withMessage('Please select a payment method')
    .isIn(['Cash on Delivery', 'Demo Online Payment']).withMessage('Invalid payment method')
];

// ------------------------------------------------------------
// Shared helper to run after any of the chains above
// ------------------------------------------------------------

/**
 * Express middleware: call after a validation chain to short-circuit
 * with flash-message redirects if validation failed. Use in routes:
 *   router.post('/register', registerValidation, handleValidation, authController.register)
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    req.flash('error', messages.join(' '));
    return res.redirect('back');
  }
  return next();
}

module.exports = {
  registerValidation,
  loginValidation,
  bookAppointmentValidation,
  productValidation,
  cartQuantityValidation,
  checkoutValidation,
  handleValidation
};
