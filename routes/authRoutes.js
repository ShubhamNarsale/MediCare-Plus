// routes/authRoutes.js
// Mounted at '/' in app.js: GET/POST /register, GET/POST /login, GET /logout.

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { requireAuth, redirectIfAuthenticated } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation, handleValidation } = require('../utils/validators');

router.get('/register', redirectIfAuthenticated, authController.showRegister);
router.post('/register', redirectIfAuthenticated, registerValidation, handleValidation, authController.register);

router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post('/login', redirectIfAuthenticated, loginValidation, handleValidation, authController.login);

router.get('/logout', requireAuth, authController.logout);

module.exports = router;
