require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ✅ Configurare Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ✅ Configurare multer pentru upload
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Doar fisiere JPEG, PNG sau WebP sunt permise"));
    }
    cb(null, true);
  },
});

app.use(cors());
app.use(express.json());

// ✅ Funcție utilitară pentru pauză (folosită la retry)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Funcție pentru a converti fișierul local în format compatibil Gemini
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

// ✅ Funcție de apelare Gemini cu logică de RETRY
async function generateContentWithRetry(prompt, imagePart, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent([prompt, imagePart]);
      return await result.response;
    } catch (error) {
      lastError = error;

      // Dacă eroarea este 429 (Rate Limit), așteptăm și încercăm din nou
      if (error.message.includes("429") || error.status === 429) {
        const delay = (i + 1) * 3000; // 3s, 6s, 9s
        console.warn(
          `⚠️ Limitare API detectată. Reîncercare ${i + 1}/${maxRetries} în ${delay / 1000}s...`,
        );
        await wait(delay);
        continue;
      }

      // Dacă este altă eroare, o aruncăm imediat
      throw error;
    }
  }
  throw lastError;
}

// ✅ Endpoint-ul principal de extracție
app.post("/api/extract", upload.single("file"), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Nu a fost incarcat niciun fisier" });
    }

    tempFilePath = req.file.path;
    console.log(`📷 Procesare Gemini AI pentru: ${req.file.originalname}`);

    const imagePart = fileToGenerativePart(tempFilePath, req.file.mimetype);

    const prompt = `
      Extract information from this Romanian Identity Card (Carte de Identitate).
      Return ONLY a valid JSON object with these exact keys:
      cnp, nume, prenume, cetatenie, locul_nasterii, domiciliu, data_nasterii, sex, emis_de, data_emiterii, data_expirarii, serie, numar.
      If a field is not visible or clear, use an empty string "".
      Respond ONLY with the JSON object, no other text.
    `;

    // Apelăm funcția cu retry
    const response = await generateContentWithRetry(prompt, imagePart);
    let text = response.text();

    // Curățare Markdown dacă există
    text = text.replace(/```json|```/g, "").trim();

    const extractedData = JSON.parse(text);

    console.log("✅ Extracție reușită cu Gemini");
    res.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("❌ Eroare finală:", error.message);
    res.status(500).json({
      success: false,
      error: error.message.includes("429")
        ? "Serverul este ocupat (limita API atinsă). Încearcă peste un minut."
        : "Eroare la procesarea AI: " + error.message,
    });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", engine: "Gemini 1.5 Flash + AutoRetry" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server Gemini cu Retry rulează pe http://localhost:${PORT}`);
});
