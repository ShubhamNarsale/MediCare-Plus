// routes/doctorRoutes.js
// Mounted at '/doctors' in app.js. Public — browsing doctors requires no login.

const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctorController');

router.get('/', doctorController.listDoctors);
router.get('/:id', doctorController.showDoctor);

module.exports = router;
