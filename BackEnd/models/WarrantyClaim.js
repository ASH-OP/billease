const mongoose = require('mongoose');

const warrantyClaimSchema = new mongoose.Schema({
    // Who submitted
    customerEmail: { type: String, required: true },
    customerName: { type: String },

    // Which bill
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'BillPhotoInfo' },
    billName: { type: String },
    shopName: { type: String },
    purchaseDate: { type: String },

    // What item
    itemName: { type: String, required: true },
    companyName: { type: String, required: true },
    itemCost: { type: Number },

    // What happened
    issueDescription: { type: String, required: true, minlength: 10 },

    // Status tracking
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Resolved'],
        default: 'Pending',
    },

    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('WarrantyClaim', warrantyClaimSchema);
