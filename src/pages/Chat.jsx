import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Send,
  Bot,
  User,
  Sliders,
  Activity,
  Sparkles,
  FileText,
} from "lucide-react";

export default function Chat() {
  const { messages, sendUserPrompt, isThinking, currentStep } = useApp();
  const [input, setInput] = useState("");

  // Local upfront vitals panel state
  const [vitals, setVitals] = useState({
    age: 65,
    weight: 75,
    creatinine: 1.2,
    bp_sys: 130,
  });

  const [showSliders, setShowSliders] = useState(true);

  const handleSliderChange = (key, val) => {
    setVitals((prev) => ({ ...prev, [key]: Number(val) }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    // Ships text and metrics together to the multi-agent backend pipeline
    sendUserPrompt(input, vitals);
    setInput("");
  };

  // 📄 HELPER FUNCTION: Structurally unpacks plain text summaries and maps guideline citations
  const renderAgentPayload = (rawText) => {
    if (!rawText || typeof rawText !== "string") return null;

    if (!rawText.includes("|||CHUNK_SPLIT|||")) {
      return (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {rawText}
        </div>
      );
    }

    // Split into structured components [Summary, Citation 1, Citation 2, ...]
    const nodes = rawText.split("|||CHUNK_SPLIT|||");
    const mainSummary = nodes[0];
    const citations = nodes.slice(1);

    return (
      <div className="space-y-4">
        {/* Main AI Clinical Summary Card */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
          {mainSummary}
        </div>

        {/* 📄 GROUND TRUTH VAULT PANEL */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <FileText size={12} className="text-purple-500" />
            Ingested Guideline Reference Base
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {citations.map((citation, idx) => {
              // Strip off legacy string headers and trim spaces natively
              const cleanCitation = citation
                .replace(/📄\s*VERIFIED\s*MINISTRY\s*CITATION\s*#\d+/gi, "")
                .trim();

              if (!cleanCitation) return null;

              return (
                <div
                  key={idx}
                  className="bg-purple-50/30 border border-purple-100/60 rounded-xl p-3 text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap"
                >
                  <span className="text-[9px] font-bold text-purple-600 block mb-1 uppercase tracking-wider">
                    • Ingested Vector Extract #{idx + 1}
                  </span>
                  {cleanCitation}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[88vh] flex bg-slate-50/50 overflow-hidden">
      {/* LEFT COLUMN: ACTIVE CHAT PLATFORM AREA */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-100">
        {/* Chat History View Frame */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 max-w-3xl mx-auto ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.sender === "user"
                    ? "bg-blue-50 border-blue-100 text-blue-600"
                    : "bg-indigo-900 border-indigo-950 text-white"
                }`}
              >
                {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`p-5 rounded-2xl border shadow-3xs max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-blue-600 border-blue-700 text-white text-sm whitespace-pre-wrap"
                    : "bg-slate-50 border-slate-100 text-slate-800"
                }`}
              >
                {msg.sender === "user"
                  ? msg.text
                  : renderAgentPayload(msg.text)}
              </div>
            </div>
          ))}

          {/* Core Orchestration Chain Animation */}
          {isThinking && (
            <div className="flex gap-4 max-w-3xl mx-auto items-center text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-pulse">
              <Activity size={14} className="text-blue-500 animate-spin" />
              <span>
                {currentStep === 0 &&
                  "🧬 Triage & Core Retrieval Extraction active..."}
                {currentStep === 1 &&
                  "🧮 Running Python Arithmetic Clearance Formulas..."}
                {currentStep === 2 &&
                  "🛡️ Verifying Source Citations to eliminate hallucinations..."}
              </span>
            </div>
          )}
        </div>

        {/* Action Footer Inputs Dock */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
            <button
              type="button"
              onClick={() => setShowSliders(!showSliders)}
              className={`p-3 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
                showSliders
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sliders size={16} />
              <span>
                Vitals Matrix {showSliders ? "(Visible)" : "(Hidden)"}
              </span>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe presentation tokens or paste clinical charts (e.g., 'What is the initial medication dosage guidelines?')"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:border-blue-500 transition text-slate-800"
              disabled={isThinking}
            />

            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="bg-indigo-900 hover:bg-indigo-950 text-white p-3 rounded-xl transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDEBAR: CLEAN DEDICATED PARAMETERS DECK */}
      {showSliders && (
        <div className="w-80 h-full bg-slate-50 p-6 overflow-y-auto space-y-6 animate-fade-in shrink-0 border-l border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Sparkles size={16} className="text-indigo-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Patient Metrics Registry
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Configure parameters prior to running agent lookup cycles.
            </p>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
            {/* AGE SLIDER */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Patient Age</span>
                <span className="font-mono bg-slate-100 px-1 rounded text-slate-800">
                  {vitals.age} yrs
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="95"
                value={vitals.age}
                onChange={(e) => handleSliderChange("age", e.target.value)}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded"
              />
            </div>

            {/* WEIGHT SLIDER */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Body Weight</span>
                <span className="font-mono bg-slate-100 px-1 rounded text-slate-800">
                  {vitals.weight} kg
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="140"
                value={vitals.weight}
                onChange={(e) => handleSliderChange("weight", e.target.value)}
                className="w-full accent-blue-600 h-1 bg-slate-100 rounded"
              />
            </div>

            {/* CREATININE SLIDER */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Serum Creatinine</span>
                <span className="font-mono bg-amber-50 text-amber-800 px-1 rounded border border-amber-100">
                  {vitals.creatinine} mg/dL
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={vitals.creatinine}
                onChange={(e) =>
                  handleSliderChange("creatinine", e.target.value)
                }
                className="w-full accent-amber-500 h-1 bg-slate-100 rounded"
              />
            </div>

            {/* BLOOD PRESSURE SLIDER */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Systolic Blood Pressure</span>
                <span className="font-mono bg-red-50 text-red-800 px-1 rounded border border-red-100">
                  {vitals.bp_sys} mmHg
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="200"
                value={vitals.bp_sys}
                onChange={(e) => handleSliderChange("bp_sys", e.target.value)}
                className="w-full accent-red-500 h-1 bg-slate-100 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
