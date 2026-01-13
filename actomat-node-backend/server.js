require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const cors = require("cors");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fișier lipsă." });

    const imagePath = req.file.path;
    const imageData = req.file.buffer.toString("base64");

    const prompt = `Extrage datele din acest buletin românesc. 
    Returnează un obiect JSON pur, fără marcaje markdown, cu următoarele chei: 
    cnp, nume, prenume, cetatenie, locul_nasterii, domiciliu, emis_de, data_nasterii, data_emiterii, data_expirarii, serie, numar, sex.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: req.file.mimetype } },
    ]);

    let text = result.response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("Răspuns procesat:", text);

    try {
      const responseData = JSON.parse(text);
      res.json(responseData);
    } catch (parseError) {
      console.error("Eroare la parsare JSON:", text);
      res.status(500).json({
        error: "Formatul răspunsului de la AI este invalid.",
        raw: text,
      });
    }

    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  } catch (error) {
    console.error("Eroare server detaliată:", error);
    res.status(500).json({
      error: "Eroare la procesarea imaginii.",
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 8000;
app.get("/", (req, res) => {
  res.send("Serverul Actomat funcționează!");
});
app.listen(PORT, () => console.log(`🚀 Server pe http://localhost:${PORT}`));

module.exports = app;
