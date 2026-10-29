// routes/hospitalRoutes.js
// Mounted at '/hospital' in app.js. Public — no login required.

const express = require('express');
const router = express.Router();

const hospitalController = require('../controllers/hospitalController');

router.get('/', hospitalController.showAbout);
router.get('/departments', hospitalController.showDepartments);
router.get('/facilities', hospitalController.showFacilities);
router.get('/contact', hospitalController.showContact);
router.get('/emergency', hospitalController.showEmergency);

module.exports = router;
