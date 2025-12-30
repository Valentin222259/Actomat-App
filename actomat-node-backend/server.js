const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Încarcă variabilele din .env

const app = express();
const port = 8000;

// 1. Configure Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json());

// 2. Configure Multer (for RAM memory)
const upload = multer({ storage: multer.memoryStorage() });

// 3. Config Gemini AI
// Verify the key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ EROARE: Lipsește GEMINI_API_KEY din fișierul .env!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using model flash-latest
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

// 4. Endpoint Extract
app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 Am primit o cerere de procesare...");

    if (!req.file) {
      return res.status(400).json({ error: "Nu ai trimis niciun fișier!" });
    }

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `
            Analizează această Carte de Identitate Românească.
            Extrage datele și returnează un JSON strict cu cheile:
            {
                "nume": "Nume de familie",
                "prenume": "Prenume",
                "CNP": "Cod numeric personal",
                "data_nasterii": "ZZ.LL.AAAA",
                "valabilitate": "ZZ.LL.AAAA"
            }
            Dacă un câmp nu e clar, pune valoarea null.
        `;

    console.log("🤖 Trimit imaginea la Gemini...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Răspuns primit!");

    // Sending JSON back to frontend
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("❌ Eroare server:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Start server
app.listen(port, () => {
  console.log(`🚀 Serverul Node.js rulează pe http://localhost:${port}`);
});
