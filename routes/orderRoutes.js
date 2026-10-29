// routes/orderRoutes.js
// Order routes for patients.
// Mounted at '/' in app.js so the public URLs remain:
// GET/POST /checkout
// GET /orders
// GET /orders/:id

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const patientController = require('../controllers/patientController');

const { requireAuth } = require('../middleware/authMiddleware');
const { requirePatient } = require('../middleware/roleMiddleware');

const {
  checkoutValidation,
  handleValidation
} = require('../utils/validators');

// ------------------------------------------------------------
// Checkout
// ------------------------------------------------------------
router.get(
  '/checkout',
  requireAuth,
  requirePatient,
  orderController.showCheckout
);

router.post(
  '/checkout',
  requireAuth,
  requirePatient,
  checkoutValidation,
  handleValidation,
  orderController.placeOrder
);

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------
router.get(
  '/orders',
  requireAuth,
  requirePatient,
  patientController.orderHistory
);

router.get(
  '/orders/:id',
  requireAuth,
  requirePatient,
  orderController.showOrder
);

module.exports = router;