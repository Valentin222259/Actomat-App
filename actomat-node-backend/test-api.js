require("dotenv").config();
const apiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
  console.log("🚀 Interogare directă Google API...");

  try {
    // Încercam să listam modelele folosind endpoint-ul stabil v1
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Eroare API:", data.error.message);
      if (data.error.status === "PERMISSION_DENIED") {
        console.log(
          "\n💡 SOLUȚIE: API-ul 'Generative Language API' nu este activat sau regiunea este restricționată.",
        );
      }
      return;
    }

    console.log("\n✅ Modele disponibile pentru cheia ta:");
    if (data.models && data.models.length > 0) {
      data.models.forEach((m) => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(` - ${m.name.split("/").pop()}`);
        }
      });
    } else {
      console.log("⚠️ Nu a fost găsit niciun model compatibil.");
    }
  } catch (err) {
    console.error("❌ Eroare de rețea/fetch:", err.message);
  }
}

checkModels();
