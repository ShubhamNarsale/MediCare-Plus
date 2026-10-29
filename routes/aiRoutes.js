// routes/aiRoutes.js
// Mounted at '/ai' in app.js. Public — the assistant answers general
// site-navigation and health-info questions, so it's useful to visitors
// who haven't registered yet, not just logged-in patients.

const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');

router.get('/', aiController.showAssistant);
router.post('/chat', aiController.chat);

module.exports = router;
