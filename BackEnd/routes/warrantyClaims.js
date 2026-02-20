const express = require('express');
const router = express.Router();
const WarrantyClaim = require('../models/WarrantyClaim');

// POST /billease/warranty-claims  — Submit a new warranty claim
router.post('/', async (req, res) => {
    try {
        const {
            customerEmail, customerName,
            billId, billName, shopName, purchaseDate,
            itemName, companyName, itemCost,
            issueDescription,
        } = req.body;

        // Basic validation
        if (!customerEmail || !itemName || !companyName || !issueDescription) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        if (issueDescription.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Issue description must be at least 10 characters.' });
        }

        const claim = await WarrantyClaim.create({
            customerEmail, customerName,
            billId, billName, shopName, purchaseDate,
            itemName, companyName, itemCost,
            issueDescription: issueDescription.trim(),
        });

        return res.status(201).json({ success: true, message: 'Warranty claim submitted successfully.', claim });
    } catch (error) {
        console.error('Error submitting warranty claim:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// GET /billease/warranty-claims?email=xxx  — Fetch claims for a customer
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email query param required.' });
        const claims = await WarrantyClaim.find({ customerEmail: email }).sort({ submittedAt: -1 });
        return res.status(200).json({ success: true, claims });
    } catch (error) {
        console.error('Error fetching warranty claims:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
