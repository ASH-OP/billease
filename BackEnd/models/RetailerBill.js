const mongoose = require('mongoose');

const retailerBillSchema = new mongoose.Schema({
  // Link to the Retailer who created this
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Bill Details
  billNumber: { type: String, required: true, unique: true },
  billDate: { type: String, required: true },
  shopName: { type: String, required: true },

  // Customer Info (To whom the bill was sent)
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true } // Critical for linking
  },

  // Items (Array of objects)
  items: [
    {
      name: String,
      company: String,
      quantity: Number,
      price: Number,
      total: Number,
      // Warranty Info
      warrantyMonths: { type: Number, default: 0 },
      warrantyExpiryDate: { type: Date, default: null } // calculated from billDate + warrantyMonths
    }
  ],
  grandTotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RetailerBill', retailerBillSchema);