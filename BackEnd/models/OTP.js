// models/OTP.js
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,  // stored as bcrypt hash
        required: true,
    },
    purpose: {
        type: String,
        default: 'registration',
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // TTL: auto-delete after 5 minutes (300 seconds)
    },
});

// One OTP doc per email — upsert pattern used in controller
module.exports = mongoose.model('OTP', OTPSchema);
