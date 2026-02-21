const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/database");
const cloudinaryConfig = require("./config/cloudinary");
const fileupload = require("express-fileupload");
const cors = require("cors");

const contactRoutes = require("./routes/contacts");
const billPhotoRoutes = require("./routes/billPhotos");
const authRoutes = require('./routes/auth');
const chatbotRoutes = require('./routes/chatbot');
// 1. Import the new route file
const billRoutes = require('./routes/billRoutes');
const warrantyClaimRoutes = require('./routes/warrantyClaims');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// --- Routes ---
app.use("/billease/auth", authRoutes);
app.use("/billease/contacts", contactRoutes);
app.use("/billease/bills", billPhotoRoutes); // Keeps existing photo routes
app.use("/billease/chatbot", chatbotRoutes);

// 2. Add the new retailer bill route
// Endpoint will be: POST http://localhost:5000/billease/retailer/bills/
app.use("/billease/retailer/bills", billRoutes);
app.use("/billease/warranty-claims", warrantyClaimRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to Billease API v1");
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const startServer = async () => {
    try {
        await dbConnect();
        cloudinaryConfig.cloudinaryConnect();
        // Always listen — required for Render (and works on localhost too)
        app.listen(PORT, () => {
            console.log(`Server is UP and RUNNING at PORT ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

// Export for Vercel serverless
module.exports = app;