// routes/cartRoutes.js
// Mounted at '/cart' in app.js. Requires a logged-in patient.

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePatient } = require('../middleware/roleMiddleware');
const { cartQuantityValidation, handleValidation } = require('../utils/validators');

router.use(requireAuth, requirePatient);

router.get('/', cartController.showCart);
router.post('/add', cartQuantityValidation, handleValidation, cartController.addToCart);
router.post('/update', cartQuantityValidation, handleValidation, cartController.updateCartItem);
router.post('/remove', cartController.removeCartItem);

module.exports = router;
