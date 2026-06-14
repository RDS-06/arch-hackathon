import { useState } from "react";
import { UploadCloud, FileCheck, Loader2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Dropzone() {
  const { uploadedFiles, setUploadedFiles } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFileSimulate = (fileName) => {
    setIsProcessing(true);
    setTimeout(() => {
      setUploadedFiles((prev) => [...prev, fileName]);
      setIsProcessing(false);
    }, 2000); // 2-second processing state simulation
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      processFileSimulate(files[0].name);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      processFileSimulate(files[0].name);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
        <label htmlFor="pdf-upload" className="cursor-pointer space-y-3 block">
          <div className="mx-auto w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
            {isProcessing ? (
              <Loader2 className="animate-spin text-blue-600" size={20} />
            ) : (
              <UploadCloud size={20} />
            )}
          </div>

          <div className="text-sm">
            <span className="font-semibold text-blue-600 hover:text-blue-700">
              Click to upload medical reference
            </span>{" "}
            or drag and drop
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Accepts formal medical guideline logs or patient EHR logs (PDF up to
            10MB)
          </p>
        </label>
      </div>

      {/* Uploaded Inventory Ledger */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
            Active Vector Context Libraries
          </span>
          {uploadedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 animate-fade-in"
            >
              <FileCheck size={14} className="text-green-600" />
              <span className="font-medium truncate max-w-xs">{file}</span>
              <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.2 rounded ml-auto">
                Indexed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
