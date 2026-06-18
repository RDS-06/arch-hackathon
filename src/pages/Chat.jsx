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
  RefreshCw,
  Heart,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Chat() {
  const { messages, sendUserPrompt, isThinking, currentStep, resetContext } =
    useApp();
  const [input, setInput] = useState("");

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
    sendUserPrompt(input, vitals);
    setInput("");
  };

  const handleClearFile = () => {
    resetContext();
    setVitals({
      age: 65,
      weight: 75,
      creatinine: 1.2,
      bp_sys: 130,
    });
  };

  const renderAgentPayload = (rawText) => {
    if (!rawText || typeof rawText !== "string") return null;

    const segments = rawText.split("|||CHUNK_SPLIT|||");
    let mainPayload = segments[0];
    const citations = segments.slice(1);

    mainPayload = mainPayload.replace(/\s+/g, " ");

    // Heuristically harvest dynamic values out of string maps independently of layout shifts
    let crclValue = "";
    const crclMatch = mainPayload.match(/(\d+(?:\.\d+)?\s*mL\/min)/i);
    if (crclMatch) {
      crclValue = crclMatch[1];
    } else if (mainPayload.includes("Computed Creatinine Clearance:")) {
      crclValue =
        mainPayload
          .split("Computed Creatinine Clearance:")[1]
          ?.split(/[•\n]/)[0]
          ?.trim() || "";
    }

    let vitalsContext = "";
    if (mainPayload.includes("Extracted Vitals Context:")) {
      vitalsContext =
        mainPayload
          .split("Extracted Vitals Context:")[1]
          ?.split(/Guideline Safety Directive:|•|\n/)[0]
          ?.trim() || "";
    }

    let safetyDirective = "";
    if (mainPayload.includes("Guideline Safety Directive:")) {
      safetyDirective =
        mainPayload
          .split("Guideline Safety Directive:")[1]
          ?.split(/•|\n/)[0]
          ?.trim() || "";
    } else if (mainPayload.includes("🚨")) {
      safetyDirective =
        mainPayload.split("🚨")[1]?.split(/•|\n/)[0]?.trim() || "";
    }
    safetyDirective = safetyDirective.replace(/🚨/g, "").trim();

    // Isolate clinical directive strings cleanly by leveraging bullet delimiters
    const blocks = mainPayload
      .split("•")
      .map((b) => b.trim())
      .filter(Boolean);
    let clinicalDirectives = [];

    blocks.forEach((block) => {
      if (
        block.includes("Extracted Vitals Context:") ||
        block.includes("Computed Creatinine Clearance:") ||
        block.includes("mL/min")
      ) {
        if (block.includes("tracks.")) {
          const splitTrack = block.split("tracks.");
          if (splitTrack[1] && splitTrack[1].trim().length > 15) {
            clinicalDirectives.push(splitTrack[1].trim());
          }
        }
        return;
      }

      if (
        !block.includes("CLINICAL INSTRUCTION SUMMARY") &&
        !block.includes("AUTOMATED PHYSIOLOGY ENGINE") &&
        !block.includes("CLINICAL LOGIC")
      ) {
        const cleanBlock = block.replace(/^[•\-\s\d\.\:]+/g, "").trim();
        if (cleanBlock.length > 12) {
          clinicalDirectives.push(cleanBlock);
        }
      }
    });

    let isHighRisk =
      mainPayload.includes("CRITICAL") || mainPayload.includes("HIGH-RISK");

    return (
      <div className="space-y-4 w-full text-slate-800 animate-fade-in">
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg tracking-wider uppercase flex items-center gap-1.5 ${
              isHighRisk
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}
            />
            {isHighRisk
              ? "High-Risk Safety Notice Active"
              : "Clinical Logic Insights Evaluated"}
          </span>
        </div>

        {crclValue && (
          <div className="border border-slate-100 bg-linear-to-b from-slate-50/60 to-white rounded-xl p-4 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                🧮 Automated Physiology Engine
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Cockcroft-Gault Core
              </span>
            </div>

            {/* 🟢 FIXED: Combined old dual columns into a premium full-width summary layout to destroy the right side empty white-space panel */}
            <div className="space-y-2">
              <div className="bg-indigo-50/30 border border-indigo-100/40 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-bold text-indigo-500 block uppercase tracking-wider">
                    Computed CrCl Output
                  </span>
                  <span className="text-base font-black text-indigo-950 font-mono tracking-tight block mt-0.5">
                    {crclValue}
                  </span>
                </div>
                {vitalsContext && (
                  <div className="sm:text-right border-t sm:border-t-0 border-indigo-100/50 pt-2 sm:pt-0">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                      Ingested Telemetry Input
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-600 block mt-0.5">
                      {vitalsContext}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {safetyDirective && (
              <div
                className={`flex gap-2 p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                  isHighRisk
                    ? "bg-red-50/40 border-red-100/60 text-red-950"
                    : "bg-amber-50/30 border-amber-100/60 text-amber-955"
                }`}
              >
                <AlertCircle
                  size={14}
                  className={`shrink-0 mt-0.5 ${isHighRisk ? "text-red-600" : "text-amber-600"}`}
                />
                <div>
                  <span className="font-extrabold uppercase tracking-wider text-[9px] block mb-0.5">
                    Guideline Directives:
                  </span>
                  {safetyDirective}
                </div>
              </div>
            )}
          </div>
        )}

        {clinicalDirectives.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 pl-0.5">
              <Heart size={11} className="text-emerald-500" />
              Evidence-Based Therapeutics Framework
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {clinicalDirectives.map((directive, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-slate-50/30 hover:bg-slate-50/80 border border-slate-100/70 rounded-xl p-3 transition group"
                >
                  <span className="w-5 h-5 rounded-lg bg-white border border-slate-100 shadow-3xs flex items-center justify-center shrink-0 text-[10px] font-mono font-bold text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600 transition">
                    {idx + 1}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 font-medium pt-0.5">
                    {directive}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {citations.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
            <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 pl-0.5">
              <FileText size={11} className="text-purple-500" />
              Verified Ingested Reference Ground Truth
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {citations.map((citation, idx) => {
                const cleanCitation = citation
                  .replace(/📄\s*VERIFIED\s*MINISTRY\s*CITATION\s*#\d+/gi, "")
                  .trim();

                if (!cleanCitation) return null;

                return (
                  <div
                    key={idx}
                    className="bg-purple-50/15 border border-purple-100/40 rounded-xl p-3 text-xs text-slate-600 font-medium leading-relaxed shadow-3xs animate-fade-in"
                  >
                    <span className="text-[9px] font-bold text-purple-600 flex items-center gap-1 mb-1 uppercase tracking-wider">
                      <CheckCircle2 size={10} /> Ingested Vector Extract Base #
                      {idx + 1}
                    </span>
                    <p className="text-slate-600 leading-relaxed font-medium whitespace-normal">
                      {cleanCitation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[88vh] flex bg-slate-50/50 overflow-hidden text-slate-900">
      <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-100">
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
                className={`p-5 rounded-2xl border shadow-3xs max-w-[85%] w-full ${
                  msg.sender === "user"
                    ? "bg-blue-600 border-blue-700 text-white text-xs font-semibold whitespace-pre-wrap shadow-sm max-w-fit"
                    : "bg-white border-slate-100 shadow-3xs"
                }`}
              >
                {msg.sender === "user"
                  ? msg.text
                  : renderAgentPayload(msg.text)}
              </div>
            </div>
          ))}

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
              placeholder="Describe presentation tokens or paste clinical charts..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium focus:outline-none focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
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

      {showSliders && (
        <div className="w-80 h-full bg-slate-50 p-6 overflow-y-auto space-y-6 shrink-0 border-l border-slate-100">
          <div className="flex justify-between items-start">
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

            <button
              type="button"
              onClick={handleClearFile}
              className="flex items-center gap-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition shrink-0 shadow-3xs"
            >
              <RefreshCw size={10} />
              <span>Reset Case</span>
            </button>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
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
