// routes/productRoutes.js
// Mounted at '/products' in app.js. Public — browsing products requires no login.

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.get('/', productController.listProducts);
router.get('/:id', productController.showProduct);

module.exports = router;
