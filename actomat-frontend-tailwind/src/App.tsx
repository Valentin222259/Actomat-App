import { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch(
        "https://nume-proiect-backend.onrender.com/extract",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!resp.ok) {
        throw new Error("Eroare la server");
      }

      const result = await resp.json();
      setData(result);
    } catch (err) {
      console.error(err);
      alert("Eroare la procesare. Asigură-te că serverul este pornit.");
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment"); // Activează camera pe mobil
      fileInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture"); // Deschide galeria
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <ShieldCheck className="text-indigo-600" size={32} />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Actomat AI
          </h1>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 border border-slate-100 mb-8">
          <p className="text-center text-slate-500 mb-6 font-medium">
            Încarcă buletinul pentru scanare
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={openCamera}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <Camera
                className="text-indigo-600 group-hover:scale-110 transition-transform"
                size={28}
              />
              <span className="text-sm font-semibold text-slate-700">
                Fă poză
              </span>
            </button>

            <button
              onClick={openGallery}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <ImageIcon
                className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
                size={28}
              />
              <span className="text-sm font-semibold text-slate-700">
                Din galerie
              </span>
            </button>
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

          {preview && (
            <div className="mt-6 relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader2
                    className="animate-spin text-indigo-600 mb-2"
                    size={32}
                  />
                  <span className="text-sm font-bold text-indigo-900">
                    Se procesează...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rezultate */}
        {data && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <span className="font-bold tracking-wide uppercase text-xs text-indigo-100">
                Date identificate
              </span>
              <CheckCircle size={18} />
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-4">
              {Object.entries(data).map(([key, value]: [string, any]) => (
                <div
                  key={key}
                  className="flex flex-col border-b border-slate-50 pb-2"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {key.replace("_", " ")}
                  </span>
                  <span className="text-slate-800 font-medium">
                    {value || "Nespecificat"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
