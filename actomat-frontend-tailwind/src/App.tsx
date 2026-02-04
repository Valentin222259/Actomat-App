import { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  RotateCw,
  X,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExtractedData {
  [key: string]: string;
}

const FIELD_LABELS: { [key: string]: string } = {
  cnp: "CNP",
  nume: "Last Name",
  prenume: "First Name",
  cetatenie: "Citizenship",
  locul_nasterii: "Birth Place",
  domiciliu: "Residence",
  data_nasterii: "Date of Birth",
  sex: "Gender",
  emis_de: "Issued By",
  data_emiterii: "Issue Date",
  data_expirarii: "Expiry Date",
  serie: "Series",
  numar: "Number",
};

const FIELD_ORDER = [
  "cnp",
  "nume",
  "prenume",
  "data_nasterii",
  "sex",
  "cetatenie",
  "locul_nasterii",
  "domiciliu",
  "serie",
  "numar",
  "data_emiterii",
  "data_expirarii",
  "emis_de",
];

function App() {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setData(null);
    setValidationWarning(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Validare: verifica daca sunt extrase campuri minime
      const extractedData = result.data;
      const requiredFields = ["cnp", "nume", "prenume"];
      const missingFields = requiredFields.filter(
        (field) => !extractedData[field] || extractedData[field].trim() === "",
      );

      if (missingFields.length > 0) {
        setValidationWarning(
          "⚠️ This doesn't appear to be a valid Romanian ID document. Please upload a clear photo of your ID card.",
        );
      }

      setData(extractedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const clearImage = () => {
    setPreview(null);
    setData(null);
    setError(null);
    setValidationWarning(null);
  };

  const resetAll = () => {
    setPreview(null);
    setData(null);
    setError(null);
    setValidationWarning(null);
  };

  const downloadResults = () => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `id-card-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 font-sans overflow-x-hidden">
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-8 px-4 md:py-12 border-b border-white/5"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-50"></div>
              <div className="relative w-11 h-11 bg-slate-900 rounded-full flex items-center justify-center border border-blue-400/30">
                <svg
                  className="w-6 h-6 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0 0h5a2 2 0 002-2V8a2 2 0 00-2-2h-5m0 0V4a2 2 0 012-2h2a2 2 0 012 2v2"
                  />
                </svg>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                Actomat
              </h1>
              <p className="text-xs md:text-sm text-blue-300/70 mt-0.5">
                Document scanner
              </p>
            </div>
          </div>
          <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed px-4 font-light">
            Scan your Romanian ID and extract information instantly
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 px-4 md:px-8 py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Upload Section */}
              {!preview && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 md:p-10 hover:border-white/20 transition-all"
                >
                  <p className="text-center text-slate-200 mb-10 font-medium text-sm md:text-base">
                    Upload your ID document
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 md:mb-8">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openCamera}
                      className="group relative p-6 md:p-8 rounded-lg border border-white/10 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all"
                    >
                      <div className="relative flex flex-col items-center gap-3">
                        <div className="p-3 bg-white/5 group-hover:bg-blue-500/10 rounded-lg transition-colors duration-300">
                          <Camera
                            className="text-blue-300 group-hover:text-blue-200 transition-colors"
                            size={28}
                          />
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
                            Take Photo
                          </span>
                          <span className="block text-xs text-slate-400 mt-1">
                            Use your camera
                          </span>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openGallery}
                      className="group relative p-6 md:p-8 rounded-lg border border-white/10 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all"
                    >
                      <div className="relative flex flex-col items-center gap-3">
                        <div className="p-3 bg-white/5 group-hover:bg-blue-500/10 rounded-lg transition-colors duration-300">
                          <ImageIcon
                            className="text-blue-300 group-hover:text-blue-200 transition-colors"
                            size={28}
                          />
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
                            From Gallery
                          </span>
                          <span className="block text-xs text-slate-400 mt-1">
                            Choose from files
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) =>
                      e.target.files?.[0] && handleUpload(e.target.files[0])
                    }
                    className="hidden"
                    accept="image/*"
                  />
                </motion.div>
              )}

              {/* Preview + Results Layout */}
              {preview && (
                <motion.div
                  key="preview-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6"
                >
                  {/* Image Preview - Left Side */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2"
                  >
                    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                      <div className="relative bg-slate-900 flex items-center justify-center overflow-hidden rounded-t-xl">
                        <div className="aspect-video w-full">
                          <img
                            src={preview}
                            alt="Document Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {loading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Loader2 className="text-blue-300" size={48} />
                            </motion.div>
                            <div className="text-center px-4">
                              <p className="font-medium text-slate-100 mb-1 text-sm">
                                Scanning document
                              </p>
                              <p className="text-xs text-slate-400">
                                Please wait...
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Image Actions */}
                      <div className="p-4 bg-white/[0.03] border-t border-white/5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={clearImage}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 rounded-lg text-xs md:text-sm text-red-300 hover:text-red-200 transition-all font-medium"
                        >
                          <X size={16} />
                          Remove Image
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Results Table - Right Side */}
                  {data && !loading && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="lg:col-span-3"
                    >
                      <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col h-full">
                        {/* Header */}
                        <div className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between gap-3 border-b border-white/5">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-100 text-base md:text-lg tracking-tight">
                              Document Information
                            </p>
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.6 }}
                            className="flex-shrink-0"
                          >
                            <CheckCircle
                              size={28}
                              className="text-emerald-400"
                            />
                          </motion.div>
                        </div>

                        {/* Validation Warning */}
                        {validationWarning && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4 md:px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2"
                          >
                            <AlertTriangle
                              size={16}
                              className="text-amber-400 flex-shrink-0 mt-0.5"
                            />
                            <p className="text-xs md:text-sm text-amber-300 font-medium">
                              {validationWarning}
                            </p>
                          </motion.div>
                        )}

                        {/* Fields Grid */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {FIELD_ORDER.map((key, index) => {
                              if (!(key in data)) return null;
                              const value = data[key];
                              const label =
                                FIELD_LABELS[key] || key.replace(/_/g, " ");

                              return (
                                <motion.div
                                  key={key}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="group p-3 md:p-4 bg-white/[0.03] border border-white/5 rounded-lg hover:border-blue-400/30 hover:bg-white/[0.06] transition-all duration-300"
                                >
                                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                                    {label}
                                  </label>
                                  <div className="flex items-center justify-between gap-2 min-h-6">
                                    <p className="text-sm md:text-base text-slate-100 font-medium break-words flex-1">
                                      {value || "—"}
                                    </p>
                                    {value && (
                                      <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          copyToClipboard(value, key)
                                        }
                                        className="flex-shrink-0 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all text-slate-400 hover:text-slate-200"
                                        title="Copy to clipboard"
                                      >
                                        {copiedField === key ? (
                                          <Check
                                            size={16}
                                            className="text-emerald-400"
                                          />
                                        ) : (
                                          <Copy size={16} />
                                        )}
                                      </motion.button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-white/5 p-4 md:p-6 bg-white/[0.02] flex flex-col sm:flex-row gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadResults}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs md:text-sm font-semibold text-white transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                          >
                            <Download size={16} />
                            Download JSON
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={resetAll}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs md:text-sm font-semibold text-slate-100 transition-all"
                          >
                            <RotateCw size={16} />
                            Scan Again
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading State */}
                  {loading && !data && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="lg:col-span-3 flex items-center justify-center min-h-96 bg-white/[0.03] border border-white/5 rounded-xl"
                    >
                      <div className="text-center text-slate-400">
                        <p className="text-sm">Processing your document...</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 md:p-5 bg-red-500/10 border border-red-400/30 rounded-lg flex items-start gap-3 backdrop-blur-sm"
                >
                  <AlertCircle
                    className="text-red-400 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-300 text-sm md:text-base">
                      Error
                    </p>
                    <p className="text-xs md:text-sm text-red-300/80 mt-1 break-words">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-6 md:py-8 text-slate-400 text-xs px-4 border-t border-white/5"
        >
          <p>
            Powered by{" "}
            <span className="text-slate-200 font-medium">Gemini AI</span> •
            Secure & Private
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
