require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

// Configurare CORS (permite frontend-ului să comunice)
app.use(cors());
app.use(express.json());

// Inițializare AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint-ul principal de Extragere
app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nu ai încărcat niciun fișier." });
    }

    // 1. Pregătim imaginea pentru AI
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const imageBase64 = imageData.toString("base64");

    // 2. Selectăm modelul Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Trimitem prompt-ul
    const prompt = `
      Extrage următoarele date din acest buletin românesc (carte de identitate) și returnează DOAR un JSON simplu, fără alte texte:
      - CNP
      - Nume
      - Prenume
      - Cetatenie
      - Locul nasterii
      - Domiciliu
      - Emis de
      - Data nasterii
      - Data emiterii
      - Data expirarii
      - Serie
      - Numar
      - Sex
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // 4. Curățăm răspunsul (ștergem ```json și ```)
    const cleanText = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanText);

    // 5. Ștergem fișierul temporar
    fs.unlinkSync(imagePath);

    // 6. Returnăm datele la Frontend
    res.json(data);
  } catch (error) {
    console.error("Eroare server:", error);
    res.status(500).json({ error: "Eroare la procesarea imaginii." });
  }
});

// Pornire server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);
});
