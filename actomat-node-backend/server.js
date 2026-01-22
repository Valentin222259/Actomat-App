require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const Tesseract = require("tesseract.js");

const app = express();

// ✅ Configure multer
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
      return cb(new Error("Only JPEG, PNG, WebP allowed"));
    }
    cb(null, true);
  },
});

// ✅ CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL || "http://localhost:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    engine: "Tesseract OCR (Local, No API)",
  });
});

// ✅ Extract text using Tesseract OCR
async function extractTextWithTesseract(imagePath) {
  try {
    console.log("🔄 Running Tesseract OCR (Local)...");

    const result = await Tesseract.recognize(imagePath, ["ron", "eng"], {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`   Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return result.data.text;
  } catch (error) {
    throw new Error(`OCR failed: ${error.message}`);
  }
}

// ✅ ULTRA-SMART PARSER
function parseRomanianID(ocrText) {
  console.log("\n=== SMART PARSING ===");

  const data = {
    cnp: "",
    nume: "",
    prenume: "",
    cetatenie: "",
    locul_nasterii: "",
    domiciliu: "",
    data_nasterii: "",
    sex: "",
    emis_de: "",
    data_emiterii: "",
    data_expirarii: "",
    serie: "",
    numar: "",
  };

  const textUpper = ocrText.toUpperCase();
  const lines = ocrText
    .split(/[\n<>]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // ========== 1. CNP (13 digits) ==========
  const cnpMatch = ocrText.match(/\b(\d{13})\b/);
  if (cnpMatch) {
    data.cnp = cnpMatch[1];
    console.log(`✅ CNP: ${data.cnp}`);
  }

  // ========== 2. DATES ==========
  const dateMatches = [];
  const dateRegex = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/g;
  let match;
  while ((match = dateRegex.exec(ocrText)) !== null) {
    const formatted = `${match[1].padStart(2, "0")}.${match[2].padStart(2, "0")}.${match[3]}`;
    if (!dateMatches.includes(formatted)) {
      dateMatches.push(formatted);
    }
  }

  if (dateMatches.length > 0) data.data_nasterii = dateMatches[0];
  if (dateMatches.length > 1) data.data_emiterii = dateMatches[1];
  if (dateMatches.length > 2) data.data_expirarii = dateMatches[2];

  console.log(`✅ Dates: ${dateMatches.join(", ")}`);

  // ========== 3. SEX ==========
  const sexMatch = textUpper.match(/\bSEX[:\s]*([MF])\b/i);
  if (sexMatch) {
    data.sex = sexMatch[1];
  }

  // ========== 4. CITIZENSHIP ==========
  if (textUpper.includes("ROMANIA")) {
    data.cetatenie = "ROMANIA";
  }

  // ========== 5. SERIE + NUMBER ==========
  const serieMatch = textUpper.match(/\b([A-Z]{2,3})\s*([0-9]{5,7})\b/);
  if (serieMatch) {
    data.serie = serieMatch[1];
    data.numar = serieMatch[2];
  }

  // ========== 6. SMART NAME EXTRACTION ==========
  // Look for "Nume" label and get next real value
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();

    // Find NUME label
    if (lineUpper.match(/^NUME$|NUME\/NOM|LAST NAME/i)) {
      // Look next lines for actual name (not label-only)
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();

        // Skip empty and all-caps lines (likely labels)
        if (
          nextLine.length > 1 &&
          !nextLine.match(/^[A-Z\s\/]+$/) &&
          !nextLine.match(/PRENUME|FIRST/i)
        ) {
          data.nume = nextLine;
          console.log(`✅ NUME: ${data.nume}`);
          break;
        }
      }
    }

    // Find PRENUME label
    if (lineUpper.match(/^PRENUME$|PRENUME\/PRENOM|FIRST NAME/i)) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();

        if (
          nextLine.length > 1 &&
          !nextLine.match(/^[A-Z\s\/]+$/) &&
          !nextLine.match(/CETATENIE|NATIONALITY/i)
        ) {
          data.prenume = nextLine;
          console.log(`✅ PRENUME: ${data.prenume}`);
          break;
        }
      }
    }

    // Find DOMICILIU
    if (lineUpper.match(/^DOMICILIU|^ADDRESS/i)) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();

        if (
          nextLine.length > 2 &&
          !nextLine.match(/^[A-Z\s]+$/) &&
          !nextLine.match(/EMIS|ISSUED/i)
        ) {
          data.domiciliu = nextLine;
          console.log(`✅ DOMICILIU: ${data.domiciliu}`);
          break;
        }
      }
    }

    // Find PLACE OF BIRTH
    if (lineUpper.match(/LOC[\s\.]*NASTERII|PLACE OF BIRTH/i)) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();

        if (
          nextLine.length > 2 &&
          !nextLine.match(/^[A-Z\s]+$/) &&
          !nextLine.match(/DOMICILIU|ADDRESS/i)
        ) {
          data.locul_nasterii = nextLine;
          console.log(`✅ LOCUL_NASTERII: ${data.locul_nasterii}`);
          break;
        }
      }
    }

    // Find ISSUING AUTHORITY
    if (lineUpper.match(/EMIS[A-Z\s]*DE\b|ISSUED BY/i)) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();

        if (nextLine.length > 2 && !nextLine.match(/VALIDITY|DATA|DATE/i)) {
          data.emis_de = nextLine.replace(/^"|"$/g, "").trim();
          console.log(`✅ EMIS_DE: ${data.emis_de}`);
          break;
        }
      }
    }
  }

  // ========== FALLBACK: Extract names if not found ==========
  if (!data.nume || !data.prenume) {
    const propNouns = ocrText.match(/\b[A-ZĂÂÎŞŢ][a-zăâîşţ]+\b/g) || [];
    const filtered = [...new Set(propNouns)].filter((w) => {
      const upper = w.toUpperCase();
      const keywords = [
        "ROMANIA",
        "CARTE",
        "IDENTITY",
        "EMIS",
        "ISSUED",
        "SIGHETU",
        "MARMATIEI",
        "CUZA",
      ];
      return !keywords.includes(upper);
    });

    if (!data.nume && filtered.length > 0) data.nume = filtered[0];
    if (!data.prenume && filtered.length > 1) data.prenume = filtered[1];
  }

  console.log("\n=== PARSED DATA ===");
  console.log(data);
  console.log("==================\n");

  return data;
}

// ✅ Main endpoint
app.post("/api/extract", upload.single("file"), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    tempFilePath = req.file.path;

    if (!fs.existsSync(tempFilePath)) {
      return res.status(400).json({
        success: false,
        error: "File upload failed",
      });
    }

    console.log(`📷 Processing: ${req.file.originalname}`);

    // Extract with Tesseract (LOCAL)
    const ocrText = await extractTextWithTesseract(tempFilePath);

    if (!ocrText || ocrText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "No text detected in image",
      });
    }

    console.log(`📝 OCR extracted ${ocrText.length} characters`);

    // Parse data
    const extractedData = parseRomanianID(ocrText);

    console.log("✅ Extraction successful");

    res.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Cleanup error:", err);
      });
    }
  }
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   🔹 OCR: Tesseract.js (Local)`);
  console.log(`   🔹 Parser: Smart regex patterns`);
  console.log(`   🔹 NO API quotas, 100% FREE`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
