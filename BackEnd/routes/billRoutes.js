// routes/billRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const { 
    createBill, 
    getMyBills, 
    getBillsForCustomer,
    scanBillWithAI,
    getBusinessInsights // <--- Import it // <--- Import the new function
} = require('../controller/billController');

router.post('/', protect, createBill);
router.get('/', protect, getMyBills);
router.get('/customer/my-bills', protect, getBillsForCustomer);

// --- New Route ---
router.post('/scan', protect, scanBillWithAI);

// --- New Route for Insights ---
router.post('/analyze', protect, getBusinessInsights);

module.exports = router;