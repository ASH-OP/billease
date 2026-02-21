// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // ... existing name, email, etc ...
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, select: false }, // Removed complex required logic for simplicity
    googleId: { type: String, unique: true, sparse: true },

    // --- CRITICAL UPDATE: SEPARATE ROLES ---
    role: {
        type: String,
        enum: ['customer', 'retailer', 'admin'], // strict values
        default: 'customer'
    },

    // --- Retailer Specific Fields ---
    shopName: { type: String, trim: true },
    shopAddress: { type: String, trim: true }, // Added shopAddress
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },   // Added panNumber
    isProfileComplete: { type: Boolean, default: false }, // Added for profile enforcement

    // --- Common Fields ---
    phoneNumber: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    profilePictureUrl: { type: String, default: '' },
    profilePictureCloudinaryId: { type: String, default: '' }
}, { timestamps: true });

// Hash password before saving (only if it was modified)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (!this.password) return false; // Google-only accounts have no password
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);