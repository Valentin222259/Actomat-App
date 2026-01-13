require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const upload = multer({ dest: path.join(__dirname, "tmp") });

// Creează folder tmp dacă nu există
if (!fs.existsSync(path.join(__dirname, "tmp"))) {
  fs.mkdirSync(path.join(__dirname, "tmp"));
}

app.use(cors());
app.use(express.json());

// Verifică API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY nu este setat în .env!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Fișier lipsă." });
    }

    const imagePath = req.file.path;

    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ error: "Fișierul nu a fost salvat." });
    }

    const imageData = fs.readFileSync(imagePath).toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    console.log(`📷 Procesez imagine: ${req.file.originalname} (${mimeType})`);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // ← SCHIMBĂ ASTA
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const prompt = `Ești expert în extragerea datelor din buletine românești.
Analizează această imagine și extrage DOAR informațiile prezente.

Returnează un obiect JSON valid cu aceste câmpuri (dacă nu găsești o informație, pune ""):
{
  "cnp": "codul de identificare",
  "nume": "marca de familie",
  "prenume": "prenumele",
  "cetatenie": "țara cetățeniei",
  "locul_nasterii": "localitatea și județul",
  "domiciliu": "adresa de domiciliu",
  "emis_de": "instituția care a emis",
  "data_nasterii": "în format DD.MM.YYYY",
  "data_emiterii": "în format DD.MM.YYYY",
  "data_expirarii": "în format DD.MM.YYYY",
  "serie": "seria buletinului",
  "numar": "numărul buletinului",
  "sex": "M/F"
}

IMPORTANT: Returnează DOAR JSON valid, fără markdown, fără backticks, fără explicații.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
      {
        text: prompt,
      },
    ]);

    if (!result.response) {
      console.error("❌ Niciun response de la AI");
      return res
        .status(500)
        .json({ error: "AI nu a generat un răspuns", details: result });
    }

    let text = result.response.text();
    console.log("📝 Răspuns brut:", text.substring(0, 100) + "...");

    // Curață markdown
    const cleanJson = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let responseData;
    try {
      responseData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("❌ JSON invalid. Text:", cleanJson);
      return res.status(500).json({
        error: "AI a returnat format invalid",
        raw: cleanJson,
        parseError: parseError.message,
      });
    }

    console.log("✅ Date extrase cu succes");
    res.json(responseData);

    // Șterge fișierul
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error("❌ Eroare detaliată:", error.message);

    // Diagnostică pentru erori de quota
    if (error.status === 429) {
      console.error("⚠️ QUOTA DEPĂȘIT! Gemini API free tier limitat.");
      console.error("Soluții:");
      console.error("1. Așteaptă 24 de ore");
      console.error("2. Upgrade-ază la plată în Google Cloud Console");
      console.error("3. Folosește alte API-uri (CloudVision, OCR.space, etc.)");
    }

    res.status(500).json({
      error: "Eroare la procesare",
      message: error.message,
      type: error.constructor.name,
      status: error.status,
    });

    // Șterge fișierul în caz de eroare
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

app.get("/", (req, res) => {
  res.send("✅ Serverul Actomat funcționează!");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server pe http://localhost:${PORT}`);
});

module.exports = app;
