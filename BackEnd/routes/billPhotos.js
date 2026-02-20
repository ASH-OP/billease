
const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const { billUpload, getBills } = require("../controller/AddBillPhotoInfo");
const { updateBills, deleteBills } = require("../controller/UpdateBillInfo");

// --- NEW: Import the AI Scan function from the other controller ---
const { scanBillWithAI } = require("../controller/billController");

router.post("/billUpload", protect, billUpload);
router.get("/getBills", protect, getBills);
router.patch("/updateBills/:id", protect, updateBills);
router.delete("/deleteBills/:id", protect, deleteBills);

// --- NEW ROUTE: Add this line ---
router.post("/scan", protect, scanBillWithAI); 
module.exports = router;




// routes/billPhotos.js
