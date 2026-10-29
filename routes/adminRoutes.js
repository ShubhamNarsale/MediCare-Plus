// routes/adminRoutes.js
// Mounted at '/admin' in app.js. Every route requires a logged-in admin.

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { productValidation, handleValidation } = require('../utils/validators');

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.dashboard);

router.get('/patients', adminController.listPatients);

router.get('/doctors', adminController.listDoctors);
router.get('/doctors/add', adminController.showAddDoctor);
router.post('/doctors/add', adminController.createDoctor);
router.get('/doctors/:id/edit', adminController.showEditDoctor);
router.post('/doctors/:id/edit', adminController.updateDoctor);
router.post('/doctors/:id/delete', adminController.deleteDoctor);

router.get('/products', adminController.listProducts);
router.get('/products/add', adminController.showAddProduct);
router.post('/products/add', productValidation, handleValidation, adminController.createProduct);
router.get('/products/:id/edit', adminController.showEditProduct);
router.post('/products/:id/edit', productValidation, handleValidation, adminController.updateProduct);
router.post('/products/:id/stock', adminController.updateProductStock);
router.post('/products/:id/delete', adminController.deleteProduct);

router.get('/appointments', adminController.listAppointments);
router.post('/appointments/:id/confirm', adminController.confirmAppointment);
router.post('/appointments/:id/cancel', adminController.cancelAppointment);
router.post('/appointments/:id/complete', adminController.completeAppointment);

router.get('/orders', adminController.listOrders);
router.post('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
