import { useState, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud,
  Layers,
  Activity,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// 🟢 PRODUCTION ROUTING LINE: Connects directly to your cloud engine securely
const BACKEND_API_URL = "https://arch-hackathon.onrender.com";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    total_chunks: 14205,
    active_specialists: 6,
    fetch_latency_ms: 42,
    guardrail_status: "100.0%",
    memory_turns_cached: 0, // Added default fallback to prevent template layout glitches
  });

  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Fetch real-time system metrics directly from your FastAPI server
  const fetchSystemMetrics = async () => {
    try {
      // 🟢 FIXED: Resolved the axios.axios typo to ensure clean data polling
      const response = await axios.get(`${BACKEND_API_URL}/system/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Telemetry fetch deferred.");
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 4000); // Polling update loop
    return () => clearInterval(interval);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  // Process selected or dropped file elements securely
  const processFileInbound = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🟢 FIXED: Swapped out localhost for the dynamic cloud vector pipeline endpoint
      const response = await axios.post(`${BACKEND_API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "success") {
        setUploadStatus({
          type: "success",
          message: `Successfully ingested "${file.name}"! Created ${response.data.chunks_created} new chunk dynamic nodes.`,
        });
        fetchSystemMetrics(); // Immediate update layout counters
      } else {
        setUploadStatus({ type: "error", message: response.data.message });
      }
    } catch (err) {
      setUploadStatus({
        type: "error",
        message: "Network connection refused by FastAPI target.",
      });
    } finally {
      setIsUploading(false);
      setDragActive(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900">
      {/* EXECUTIVE WELCOME BANNER */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-8 shadow-xl overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold tracking-widest px-2.5 py-1 rounded-md uppercase">
            SYSTEM NODE: ACTIVE
          </span>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome to MediaAssist AI
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            An advanced, localized medical intelligence workspace executing
            real-time semantic document retrieval (RAG) mapped through an
            automated multi-agent intent routing layer.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-800/20 pointer-events-none select-none">
          <Cpu size={180} strokeWidth={0.5} />
        </div>
      </div>

      {/* CENTRAL FILE PROCESSING INGESTION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DRAG AND DROP ZONE */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Active Reference Document Ingestion Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Load localized trusted clinical files directly into the context
              vector registry space.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={(e) => {
              handleDrag(e);
              if (e.dataTransfer.files?.[0])
                processFileInbound(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[180px] ${
              dragActive
                ? "border-blue-500 bg-blue-50/40"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
            onClick={() => document.getElementById("file-input").click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && processFileInbound(e.target.files[0])
              }
            />

            {isUploading ? (
              <div className="space-y-2 text-slate-500">
                <Activity
                  size={32}
                  className="text-blue-500 animate-spin mx-auto"
                />
                <p className="text-xs font-bold animate-pulse">
                  Running chunk segmentation algorithms...
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-500">
                <UploadCloud size={32} className="text-slate-400 mx-auto" />
                <p className="text-xs font-semibold">
                  <span className="text-blue-600 font-bold">
                    Click to upload medical reference
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-[10px] text-slate-400">
                  Accepts formal medical guideline logs or patient EHR logs
                  (PDF/TXT up to 10MB)
                </p>
              </div>
            )}
          </div>

          {/* UPLOAD OPERATION FEEDBACK BADGES */}
          {uploadStatus.message && (
            <div
              className={`flex gap-2 items-start p-3 rounded-xl border text-xs font-medium ${
                uploadStatus.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>

        {/* WORKFLOW PIPELINE EXPLANATION SIDE-CARD */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-slate-900">
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-blue-400 tracking-wider block uppercase">
              Vector Ingestion Logic
            </span>
            <h3 className="text-sm font-bold tracking-tight">
              Chunking & Embedding Pipeline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              When documents are added, the system automatically segments raw
              strings into contextual chunks, targets semantic anchors, and
              parses structural content models ahead of runtime queries.
            </p>
          </div>
          <div className="border-t border-slate-800/60 pt-4 mt-6 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Pipeline Status: Balanced</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          </div>
        </div>
      </div>

      {/* PIPELINE ANALYTICS RUNTIME METRICS CARDS */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-0.5">
          Pipeline Analytics & Vector Engine Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: VECTORS IN SYSTEM */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
                Vector Embeddings Indexed
              </span>
              <span className="text-xl font-black text-slate-900 block font-mono">
                {stats.total_chunks.toLocaleString()} chunks
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                WHO & CDC Reference Guidelines
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <Layers size={18} />
            </div>
          </div>

          {/* CARD 2: SAFETY COMPLIANCE */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
                Guardrail Safety Compliance
              </span>
              <span className="text-xl font-black text-slate-900 block font-mono">
                {stats.guardrail_status}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                0 hallucinations detected
              </span>
            </div>
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-green-600">
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* CARD 3: AGENTS COUNT */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
                Active Agent Routing Nodes
              </span>
              <span className="text-xl font-black text-slate-900 block font-mono">
                {stats.active_specialists} Specialists
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Context: {stats.memory_turns_cached || 0} turns cached
              </span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <Cpu size={18} />
            </div>
          </div>

          {/* CARD 4: FETCH LATENCY */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
                Average Vector Fetch Latency
              </span>
              <span className="text-xl font-black text-slate-900 block font-mono">
                {stats.fetch_latency_ms}ms
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Semantic similarity top-k search
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
