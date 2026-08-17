const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;
