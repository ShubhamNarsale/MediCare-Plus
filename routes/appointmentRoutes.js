// routes/appointmentRoutes.js
// Mounted at '/appointments' in app.js. All appointment actions require
// a logged-in patient (booking is a patient-only action; admins manage
// appointments separately under /admin/appointments).

const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePatient } = require('../middleware/roleMiddleware');
const { bookAppointmentValidation, handleValidation } = require('../utils/validators');

router.use(requireAuth, requirePatient);

router.get('/', appointmentController.listMyAppointments);
router.get('/slots', appointmentController.getAvailableSlots);
router.get('/book/:doctorId', appointmentController.showBookForm);
router.post('/book', bookAppointmentValidation, handleValidation, appointmentController.bookAppointment);
router.get('/:id', appointmentController.showAppointment);
router.post('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;
