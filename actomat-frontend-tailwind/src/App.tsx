import { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface ExtractedData {
  [key: string]: string;
}

function App() {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Reset state
    setError(null);
    setData(null);

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    // Show preview
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // ✅ Use /api path - will be proxied to backend
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

      setData(result.data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <ShieldCheck className="text-indigo-600" size={36} />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Actomat AI</h1>
            <p className="text-sm text-slate-500">ID Document Scanner</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-8">
          <p className="text-center text-slate-600 mb-8 font-medium">
            Scan your Romanian ID document
          </p>

          {/* Upload Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={openCamera}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Camera
                className="text-indigo-600 group-hover:scale-110 transition-transform"
                size={32}
              />
              <span className="text-sm font-semibold text-slate-700">
                Take Photo
              </span>
            </button>

            <button
              onClick={openGallery}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <ImageIcon
                className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all"
                size={32}
              />
              <span className="text-sm font-semibold text-slate-700">
                From Gallery
              </span>
            </button>
          </div>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) =>
              e.target.files?.[0] && handleUpload(e.target.files[0])
            }
            className="hidden"
            accept="image/*"
          />

          {/* Preview */}
          {preview && (
            <div className="mb-8 relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              {loading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader2
                    className="animate-spin text-indigo-600 mb-3"
                    size={40}
                  />
                  <span className="text-sm font-bold text-indigo-900">
                    Processing document...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {data && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between">
              <span className="font-bold tracking-wide uppercase text-sm text-white">
                Extracted Data
              </span>
              <CheckCircle size={24} className="text-indigo-100" />
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="border-b border-slate-100 pb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                      {key.replace(/_/g, " ")}
                    </label>
                    <p className="text-slate-800 font-medium text-lg">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
