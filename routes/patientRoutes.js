// routes/patientRoutes.js
// Mounted at '/patient' in app.js. Every route requires a logged-in patient.

const express = require('express');
const router = express.Router();

const patientController = require('../controllers/patientController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePatient } = require('../middleware/roleMiddleware');

router.use(requireAuth, requirePatient);

router.get('/dashboard', patientController.dashboard);
router.get('/profile', patientController.showProfile);
router.get('/profile/edit', patientController.showEditProfile);
router.post('/profile', patientController.updateProfile);
router.get('/orders', patientController.orderHistory);
router.get('/orders/:id', patientController.orderDetails);

module.exports = router;
