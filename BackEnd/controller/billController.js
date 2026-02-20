// controller/billController.js
const RetailerBill = require('../models/RetailerBill');
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require('dotenv').config(); // Ensure env vars are loaded

// 1. Create Bill (Retailer Only)
const createBill = async (req, res) => {
  try {
    const { billNumber, date, customer, items, grandTotal, shopName } = req.body;

    // Compute warrantyExpiryDate for each item that has a warranty
    const processedItems = (items || []).map(item => {
      if (item.warrantyMonths && item.warrantyMonths > 0) {
        const purchaseDate = new Date(date);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + item.warrantyMonths);
        return { ...item, warrantyExpiryDate: expiryDate };
      }
      return { ...item, warrantyExpiryDate: null };
    });

    const newBill = new RetailerBill({
      retailerId: req.user.id,
      billNumber,
      billDate: date,
      customer,
      items: processedItems,
      grandTotal,
      shopName
    });

    await newBill.save();
    res.status(201).json({ success: true, message: 'Bill Saved', data: newBill });
  } catch (error) {
    console.error("Create Bill Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Retailer's Bills
const getMyBills = async (req, res) => {
  try {
    const bills = await RetailerBill.find({ retailerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Get Bills Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Customer's Bills
const getBillsForCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const bills = await RetailerBill.find({ "customer.email": user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    console.error("Get Customer Bills Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- 4. AI Scan Controller (UPDATED MODEL) ---
const scanBillWithAI = async (req, res) => {
  try {
    console.log("--- AI Scan Request Started ---");

    // 1. Check API Key
    if (!process.env.GEMINI_API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in .env");
      return res.status(500).json({ success: false, message: "Server configuration error: API Key Missing" });
    }

    // 2. Check File
    if (!req.files || !req.files.billPhoto) {
      console.log("No file found in request.");
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const file = req.files.billPhoto;
    console.log("Processing file:", file.name);

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // FIX: Updated to the model you found in your list
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Process Image
    const imageBuffer = fs.readFileSync(file.tempFilePath);
    const base64Image = imageBuffer.toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.mimetype,
      },
    };

    // 5. Prompt
    const prompt = `
      You are a data extraction assistant. Analyze this bill image.
      Extract the following fields and return them in strict JSON format.
      
      Fields:
      - "shopName": (string) Name of the store.
      - "purchaseDate": (string) Date in YYYY-MM-DD format.
      - "shopAddress": (string) Address of the store.
      - "shopPhoneNumber": (string) Phone number.
      - "billName": (string) A short title like "Purchase at [ShopName]".
      - "items": (array of objects) Each object must have "itemName" (string) and "cost" (number).
      
      Rules:
      1. Return ONLY the JSON object. Do not add markdown blocks like \`\`\`json.
      2. If a field is missing, use null.
      3. "cost" must be a number.
    `;

    console.log("Sending request to Gemini 2.0 Flash...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Raw Response:", text);

    // 6. Clean & Parse JSON
    let extractedData;
    try {
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}') + 1;

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonString = text.substring(startIndex, endIndex);
        extractedData = JSON.parse(jsonString);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (parseError) {
      console.error("JSON Parsing Failed. Raw Text:", text);
      return res.status(500).json({ success: false, message: "AI response format error" });
    }

    console.log("Extracted Data Successfully");

    res.status(200).json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error("AI Scan Critical Error:", error);
    res.status(500).json({ success: false, message: "AI Scan failed: " + error.message });
  }
};


const getBusinessInsights = async (req, res) => {
  try {
    const { summary } = req.body; // We will send the calculated stats from frontend

    if (!summary) {
      return res.status(400).json({ success: false, message: "No analytics data provided" });
    }

    // Check API Key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "Server API Key Config Error" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Act as a senior retail business consultant. I will provide you with the current performance metrics of my retail store.
      
      DATA SUMMARY:
      ${JSON.stringify(summary, null, 2)}

      Based on this data, provide specific, actionable growth recommendations.
      Structure your response into these 3 sections:
      1. 📈 **Revenue & Trends Strategy**: How to improve sales based on the revenue trends and busy days.
      2. 📦 **Inventory & Product Strategy**: Advice based on top selling items.
      3. 🎯 **Marketing & Customer Action**: Specific campaigns or actions to take (e.g., "Run a sale on [Day] because it is your slowest day").

      Format the output as clean HTML (using <h3>, <p>, <ul>, <li>, <strong> tags) so I can render it directly in my app. Do NOT use markdown backticks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      advice: text
    });

  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate insights" });
  }
};

module.exports = { createBill, getMyBills, getBillsForCustomer, scanBillWithAI, getBusinessInsights };