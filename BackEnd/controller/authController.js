// controller/authController.js

// --- Single set of imports at the top ---
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Ensure environment variables are loaded FIRST
const { OAuth2Client } = require('google-auth-library'); // Import Google library
// Import Cloudinary helpers
const { uploadFileToCloudinary, deleteFileFromCloudinary, isFileTypeSupported } = require('../utils/cloudinaryUtils'); // Adjust path if needed


// --- Initialize Google OAuth2 Client AFTER imports and dotenv ---
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Check if GOOGLE_CLIENT_ID was loaded correctly
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("\n!!! FATAL ERROR: GOOGLE_CLIENT_ID environment variable is not defined! Google Auth will fail. !!!\n");
    // Optionally exit if this is critical for your app startup
    // process.exit(1);
}


// --- Helper to Generate JWT ---
const generateToken = (id) => {
    // Ensure JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET environment variable is not defined!");
        // In a real app, you might throw an error or exit here
        return null; // Prevent signing with undefined secret
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token expires in 30 days
    });
};

// --- Register User ---
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // 3. Create user (password hashing happens via mongoose middleware)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'customer'
        });

        // 4. Generate token and send response
        if (user) {
            const token = generateToken(user._id);
            if (!token) { // Check if token generation failed (missing secret)
                return res.status(500).json({ success: false, message: 'Server configuration error (JWT).' });
            }
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token: token,
                user: { // Exclude sensitive fields if necessary
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    // Include other non-sensitive fields needed by frontend
                    profilePictureUrl: user.profilePictureUrl,
                    phoneNumber: user.phoneNumber,
                    address: user.address
                }
            });
        } else {
            // This case might indicate an issue with User.create not returning the user
            res.status(400).json({ success: false, message: 'Failed to create user data.' });
        }

    } catch (error) {
        console.error("Registration Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// --- Login User ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        // Fetch user including password only for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists and password matches
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);
            if (!token) { // Check if token generation failed
                return res.status(500).json({ success: false, message: 'Server configuration error (JWT).' });
            }
            // Return user data excluding password
            const userData = user.toObject(); // Convert mongoose doc to plain object
            delete userData.password;       // Explicitly remove password field

            res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: userData // Send sanitized user data
            });
        } else {
            // Generic error for security
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// --- Get Me (Get current logged-in user's profile) ---
exports.getMe = async (req, res) => {
    try {
        // req.user.id is attached by the 'protect' middleware
        // Fetch user *without* the password field explicitly
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            // This could happen if the user was deleted after the token was issued
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user }); // Send user data
    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

// --- Google Auth Handler ---
exports.googleAuth = async (req, res) => {
    const { credential, role } = req.body; // ID token from frontend + ROLE

    if (!credential) {
        return res.status(400).json({ success: false, message: 'Missing Google credential token.' });
    }
    // Ensure googleClient is initialized (check added earlier)
    if (!googleClient) {
        console.error("Google Client not initialized!");
        return res.status(500).json({ success: false, message: 'Google Auth configuration error.' });
    }

    try {
        // 1. Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // 2. Extract user info from payload
        const { sub: googleId, email, name, picture } = payload; // 'picture' is the Google profile pic URL
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email not provided by Google.' });
        }

        // 3. Find or Create User in DB
        let user = await User.findOne({ googleId: googleId });

        if (!user) {
            // If no user with this googleId, check if an account exists with the same email
            user = await User.findOne({ email: email });
            if (user) {
                // Found user by email - Link Google ID to this existing account

                // --- CRITICAL FIX: Check if the existing user's role matches the requested role ---
                if (role && user.role !== role) {
                    return res.status(403).json({
                        success: false,
                        message: `This account is registered as a ${user.role}. Please use the ${user.role === 'customer' ? 'Customer' : 'Retailer'} Login.`
                    });
                }

                user.googleId = googleId;
                // Optionally update name/picture if desired and not already set
                if (!user.name && name) user.name = name;
                if (!user.profilePictureUrl && picture) user.profilePictureUrl = picture;
                await user.save();
                console.log(`Linked Google ID ${googleId} to existing user ${email}`);
            } else {
                // No user found by googleId or email - Create a new user
                console.log(`Creating new user via Google: ${email}`);

                // --- CRITICAL FIX: Ensure valid role is used ---
                const statusRole = role === 'retailer' ? 'retailer' : 'customer'; // Default to customer if invalid/missing

                user = await User.create({
                    googleId: googleId,
                    email: email,
                    name: name || 'Google User', // Use Google name or default
                    profilePictureUrl: picture || '', // Use Google picture or empty
                    role: statusRole, // <--- Assign the requested role
                    // Password field is not needed due to model change (required: function(){...})
                });
                if (!user) { // Check if creation failed for some reason
                    throw new Error("Database error: Failed to create user account via Google.");
                }
            }
        } else {
            // User found via Google ID directly

            // --- CRITICAL FIX: Check if the user's role matches the requested role ---
            if (role && user.role !== role) {
                return res.status(403).json({
                    success: false,
                    message: `This account is registered as a ${user.role}. Please use the ${user.role === 'customer' ? 'Customer' : 'Retailer'} Login.`
                });
            }
        }
        // If user was found directly by googleId, they are already registered/linked.

        // 4. Generate OUR application's JWT token for the session
        const appToken = generateToken(user._id);
        if (!appToken) { // Check if token generation failed
            return res.status(500).json({ success: false, message: 'Server configuration error (JWT).' });
        }

        // 5. Send Success Response (excluding password)
        const userData = user.toObject();
        delete userData.password; // Ensure password is not sent

        res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            token: appToken,
            user: userData // Send sanitized user data
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        if (error instanceof ReferenceError && error.message.includes('googleClient')) {
            console.error("Google Client Initialization Error - Check environment variables and initialization order.");
            return res.status(500).json({ success: false, message: 'Internal server configuration error.' });
        }
        if (error.message.includes("Invalid token signature") || error.message.includes("Token used too late") || error.message.includes("Wrong recipient")) {
            return res.status(401).json({ success: false, message: 'Invalid or expired Google token.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: error.message || 'Server error during Google authentication.' });
    }
};

// --- Update User Profile ---
exports.updateProfile = async (req, res) => {
    const userId = req.user.id; // User ID from 'protect' middleware
    const { name, phoneNumber, address, shopName, shopAddress, gstNumber, panNumber, isProfileComplete } = req.body;
    const profilePictureFile = req.files ? req.files.profilePicture : null;

    console.log(`--- Profile Update Request --- User: ${userId}`);

    try {
        // 1. Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 2. Prepare updates object
        const updates = {};
        let oldPictureCloudinaryId = user.profilePictureCloudinaryId; // Store old picture ID

        // --- Update text fields if provided ---
        if (name !== undefined && name.trim() !== '' && name.trim() !== user.name) updates.name = name.trim();
        if (phoneNumber !== undefined && phoneNumber.trim() !== user.phoneNumber) updates.phoneNumber = phoneNumber.trim();
        if (address !== undefined && address.trim() !== user.address) updates.address = address.trim();

        // --- Retailer Fields ---
        if (shopName !== undefined && shopName.trim() !== '') updates.shopName = shopName.trim();
        if (shopAddress !== undefined && shopAddress.trim() !== '') updates.shopAddress = shopAddress.trim(); // Assuming schema has shopAddress, if not, maybe mapping to address? Checking User.js...
        // Note: User.js showed 'address' but not explicitly 'shopAddress' in the snippet I saw earlier, 
        // but 'CompleteRetailerProfile.jsx' sends 'shopAddress'. 
        // Let's assume 'address' is the common field or we need to check the model again. 
        // Wait, looking at User.js view from step 28:
        // 26:     address: { type: String, trim: true, default: '' },
        // It does NOT have shopAddress. It has 'address'.
        // So 'shopAddress' from frontend should likely update 'address' OR we need to add 'shopAddress' to model.
        // However, standardizing on 'address' for both seems safer if model isn't changing.
        // BUT, if the user explicitly differentiates them, it might be an issue.
        // Let's double check the User model content I read in step 28.
        // It has check_models.js, maybe I can use that? 
        // Actually, looking at the code I read:
        // 21:     shopName: { type: String, trim: true },
        // 22:     gstNumber: { type: String, trim: true },
        // ...
        // 26:     address: { type: String, trim: true, default: '' },

        // FrontEnd sends: shopName, shopAddress, gstNumber, panNumber.
        // I will map shopAddress to address if address is not already set or updated.
        if (shopAddress !== undefined && shopAddress.trim() !== '') updates.address = shopAddress.trim();

        if (gstNumber !== undefined) updates.gstNumber = gstNumber; // Allow null to clear? Or just update if present.
        if (panNumber !== undefined) updates.panNumber = panNumber;

        // Mark profile as complete if requested
        if (isProfileComplete === true) updates.isProfileComplete = true;

        // --- End text field updates ---

        // 3. Handle Profile Picture Upload (if a new file was sent)
        if (profilePictureFile) {
            console.log("Processing profile picture update...");
            const supportedTypes = ["jpg", "jpeg", "png", "webp", "gif"];
            const fileExtension = profilePictureFile.name.split('.').pop()?.toLowerCase(); // Use optional chaining

            if (!fileExtension || !isFileTypeSupported(fileExtension, supportedTypes)) {
                return res.status(400).json({ success: false, message: `Unsupported file type: .${fileExtension || 'unknown'}` });
            }

            // Upload new picture to Cloudinary
            try {
                const folderName = `profile_pictures/${userId}`;
                const uploadResponse = await uploadFileToCloudinary(profilePictureFile, folderName, "image");

                updates.profilePictureUrl = uploadResponse.secure_url;
                updates.profilePictureCloudinaryId = uploadResponse.public_id;
                console.log("New profile picture uploaded:", uploadResponse.public_id);

            } catch (uploadError) {
                console.error("Profile picture upload failed:", uploadError);
                return res.status(500).json({ success: false, message: "Failed to upload profile picture." });
            }
        }

        // 4. Check if there are any actual updates to apply (text or file)
        if (Object.keys(updates).length === 0) {
            console.log("No actual profile fields changed.");
            // Return current user data if no changes were made
            const currentUserData = user.toObject();
            delete currentUserData.password;
            return res.status(200).json({ success: true, message: "No changes detected.", user: currentUserData });
        }

        // 5. Update user document in the database
        console.log("Applying profile updates:", updates);
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, {
            new: true,          // Return the modified document
            runValidators: true // Run schema validations on update
        }).select('-password'); // Exclude password from the returned document

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User update failed (not found)." });
        }
        console.log("User profile updated successfully in DB.");

        // 6. Delete the *old* profile picture from Cloudinary IF a new one was successfully uploaded
        // Check if updates object contains a new picture ID and if there was an old one
        if (updates.profilePictureCloudinaryId && oldPictureCloudinaryId) {
            console.log(`Deleting old profile picture: ${oldPictureCloudinaryId}`);
            // Fire-and-forget deletion (don't block response for this)
            deleteFileFromCloudinary(oldPictureCloudinaryId, "image")
                .then(result => console.log("Old picture deletion result:", result.result))
                .catch(delError => console.error("Error deleting old profile picture (async):", delError));
        }

        // 7. Send success response with the updated user data
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser // Send the updated user object (password already excluded)
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: "Server error while updating profile." });
    }
};