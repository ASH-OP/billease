// check_models.js
require('dotenv').config(); // Make sure you have dotenv installed

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env file");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Checking available Gemini models...");

fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("❌ API Error:", data.error.message);
        } else {
            console.log("✅ Available Models:");
            const models = data.models || [];
            // Filter for models that support 'generateContent'
            const contentModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
            
            contentModels.forEach(model => {
                console.log(`   - ${model.name.replace('models/', '')}`);
            });
            console.log("\n👉 Use one of the names above in your billController.js");
        }
    })
    .catch(err => console.error("Network Error:", err));