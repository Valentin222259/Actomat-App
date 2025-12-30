import React, { useState, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiCheck, FiCpu, FiX } from "react-icons/fi"; // Am scos FiImage daca nu e folosit

// Definim tipurile pentru rezultat
interface ExtractionResult {
  [key: string]: string | null;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // --- Logică ---

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Te rog încarcă doar imagini (JPG/PNG).");
      return;
    }
    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  // Folosim React.DragEvent pentru a evita conflictele
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Verificăm conexiunea la portul 8000
      const res = await fetch("http://localhost:8000/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Încercăm să citim eroarea de la server, dacă există
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Eroare conexiune server");
      }

      const data: ExtractionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // Mesaj mai prietenos pentru erori comune
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Nu pot contacta serverul. Verifică dacă backend-ul rulează pe portul 8000."
        );
      } else {
        setError(err.message || "A apărut o eroare necunoscută.");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const formatKey = (key: string) => key.replace(/_/g, " ");

  // --- UI ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="p-8 text-center border-b border-gray-100">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 mb-2">
            Actomat AI
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Extragere date buletin cu Inteligență Artificială
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Zona Drag & Drop */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("hidden-input")?.click()}
            className={`
              relative group cursor-pointer transition-all duration-300 ease-in-out
              border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center
              ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
              }
            `}
          >
            <input
              type="file"
              id="hidden-input"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />

            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div
                  key="upload-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="bg-indigo-100 p-4 rounded-full inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <FiUploadCloud className="text-3xl text-indigo-600" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Trage o imagine aici
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    sau click pentru a încărca
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview-image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative h-full w-full p-2"
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={reset}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <FiX />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mesaje Eroare */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Buton Acțiune */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`
              w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2
              transition-all duration-300
              ${
                !file || loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-pink-600 hover:shadow-indigo-500/30 hover:-translate-y-1"
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Se procesează...</span>
              </>
            ) : (
              <>
                <FiCpu /> Extrage Datele
              </>
            )}
          </button>

          {/* Rezultate */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-4"
              >
                <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                  <FiCheck className="text-green-500" /> Rezultate Identificate
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(result).map(([key, value], idx) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                    >
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        {formatKey(key)}
                      </span>
                      <span
                        className={`font-medium ${
                          value ? "text-gray-800" : "text-gray-300 italic"
                        }`}
                      >
                        {value || "Nedetectat"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
