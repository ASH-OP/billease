// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth, updateProfile, sendOtp, verifyOtp } = require('../controller/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

module.exports = router;