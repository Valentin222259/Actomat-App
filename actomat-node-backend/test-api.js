require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY nu e setat!");
  process.exit(1);
}

console.log("🔍 Testez API Key...");
console.log("API Key starts with:", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

(async () => {
  try {
    console.log("\n📋 Listez modelele disponibile...\n");
    const models = await genAI.listModels();

    console.log(`Total modele: ${models.length}\n`);

    let hasFlash = false;
    let hasPro = false;

    models.forEach((m) => {
      const name = m.name;
      const methods = m.supportedGenerationMethods || [];

      if (methods.includes("generateContent")) {
        console.log(`✅ ${name}`);
        if (name.includes("flash")) hasFlash = true;
        if (name.includes("pro")) hasPro = true;
      }
    });

    console.log("\n📊 Rezultat:");
    if (hasFlash) {
      console.log("✅ Ai acces la gemini-1.5-flash");
    } else {
      console.log("❌ NU ai acces la gemini-1.5-flash");
    }

    if (hasPro) {
      console.log("✅ Ai acces la gemini-1.5-pro");
    } else {
      console.log("❌ NU ai acces la gemini-1.5-pro");
    }
  } catch (error) {
    console.error("❌ Eroare:", error.message);
    if (error.status === 401) {
      console.error("🔴 API KEY INVALID!");
    }
  }
})();
