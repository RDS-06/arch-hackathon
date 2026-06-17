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
  Calculator,
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

  // 📄 CLINICAL AGENT RESPONSE PARSER: Handles extraction matrix formatting
  const renderAgentPayload = (rawText) => {
    if (!rawText || typeof rawText !== "string") return null;

    const segments = rawText.split("|||CHUNK_SPLIT|||");
    let mainPayload = segments[0];
    const citations = segments.slice(1);

    mainPayload = mainPayload
      .replace(
        /─────────────────────────────────────────────────────────────────/g,
        "",
      )
      .replace(/🧮 AUTOMATED AGENT CALCULATOR ENGINE/g, "")
      .replace(/AUTOMATED AGENT CALCULATOR ENGINE/g, "")
      .replace(/\s+/g, " ")
      .replace(/modification\s+s\b/g, "modifications");

    let crclValue = "";
    if (mainPayload.includes("Computed Creatinine Clearance:")) {
      crclValue =
        mainPayload
          .split("Computed Creatinine Clearance:")[1]
          ?.split("•")[0]
          ?.trim() || "";
    }

    let vitalsContext = "";
    if (mainPayload.includes("Extracted Vitals Context:")) {
      vitalsContext =
        mainPayload
          .split("Extracted Vitals Context:")[1]
          ?.split("Guideline Safety Directive:")[0]
          ?.split("•")[0]
          ?.trim() || "";
    }

    let safetyDirective = "";
    if (mainPayload.includes("Guideline Safety Directive:")) {
      safetyDirective =
        mainPayload
          .split("Guideline Safety Directive:")[1]
          ?.split("•")[0]
          ?.replace(/🚨/g, "")
          ?.trim() || "";
    }

    let introductoryText = "";
    let clinicalDirectives = [];

    const bulletChunks = mainPayload.split("•");
    bulletChunks.forEach((chunk, idx) => {
      const cleanChunk = chunk.trim();
      if (idx === 0) {
        const cleanIntro = cleanChunk
          .replace(/.*CLINICAL INSTRUCTION METRICS SUMMARY/gi, "")
          .replace(/.*AUTOMATED PHYSIOLOGY ENGINE/gi, "")
          .trim();
        if (
          cleanIntro.length > 15 &&
          !cleanIntro.includes("Guideline Safety Directive")
        ) {
          introductoryText = cleanIntro;
        }
        return;
      }

      if (
        !cleanChunk.includes("Computed Creatinine Clearance") &&
        !cleanChunk.includes("Extracted Vitals Context") &&
        !cleanChunk.includes("CLINICAL LOGIC") &&
        !cleanChunk.includes("AUTOMATED AGENT") &&
        !cleanChunk.includes("CALCULATOR ENGINE")
      ) {
        let finalLine = cleanChunk
          .split("Guideline Safety Directive:")[0]
          .trim();
        if (finalLine.length > 5) clinicalDirectives.push(finalLine);
      }
    });

    let isHighRisk =
      mainPayload.includes("CRITICAL") ||
      mainPayload.includes("HIGH-RISK") ||
      mainPayload.includes("contraindicated");

    return (
      <div className="space-y-5 w-full text-slate-800 animate-fade-in">
        {/* TOP STATUS BADGE */}
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

        {/* SECTION 1: PHYSIOLOGY METRICS MODULE */}
        {crclValue && (
          <div className="border border-slate-100 bg-linear-to-b from-slate-50/60 to-white rounded-xl p-4 shadow-3xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator size={13} className="text-indigo-600" />
                Automated Physiology Engine
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Cockcroft-Gault Core
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-indigo-50/20 border border-indigo-100/30 p-3 rounded-xl">
                <span className="text-[9px] font-bold text-indigo-500 block uppercase tracking-wider">
                  Computed CrCl Output
                </span>
                <span className="text-sm font-black text-indigo-950 font-mono tracking-tight block mt-0.5">
                  {crclValue}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100/70 p-3 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                  Ingested Telemetry Input
                </span>
                <span className="text-xs font-semibold text-slate-600 block mt-1 leading-snug">
                  {vitalsContext}
                </span>
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

        {/* SECTION 2: INTRODUCTORY OVERVIEW */}
        {introductoryText && (
          <p className="text-xs font-semibold leading-relaxed text-slate-500 pl-0.5 bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
            {introductoryText}
          </p>
        )}

        {/* SECTION 3: THERAPEUTICS TILES GRID */}
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
                  className="flex items-start gap-3 bg-white hover:bg-slate-50/40 border border-slate-100 rounded-xl p-3.5 transition group shadow-3xs"
                >
                  <span className="w-5 h-5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600 group-hover:bg-blue-50/30 transition">
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

        {/* SECTION 4: INGESTED REFERENCE GROUND TRUTH ACCORDIONS */}
        {citations.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
            <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 pl-0.5">
              <FileText size={11} className="text-purple-500" />
              Verified Ingested Reference Ground Truth
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {citations.map((citation, idx) => {
                const cleanCitation = citation
                  .replace(/📄\s*VERIFIED\s*MINISTRY\s*REFERENCE\s*BASE/gi, "")
                  .trim();

                if (!cleanCitation) return null;

                const subLines = cleanCitation
                  .split("•")
                  .map((l) => l.trim())
                  .filter(Boolean);
                const sourceHeader = subLines[0] || "";
                const dataBullets = subLines.slice(1);

                return (
                  <div
                    key={idx}
                    className="bg-purple-50/15 border border-purple-100/40 rounded-xl p-4 text-xs text-slate-600 font-medium leading-relaxed shadow-3xs"
                  >
                    <span className="text-[9px] font-bold text-purple-600 flex items-center gap-1 mb-2.5 uppercase tracking-wider block border-b border-purple-100/30 pb-1.5">
                      <CheckCircle2 size={10} /> Ingested Vector Extract Base #
                      {idx + 1}
                    </span>

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-700">
                        {sourceHeader}
                      </p>

                      <div className="space-y-1.5 pl-1.5">
                        {dataBullets.map((bullet, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-start gap-1.5 text-xs text-slate-600"
                          >
                            <span className="text-purple-400 mt-0.5 shrink-0">
                              •
                            </span>
                            <p className="leading-normal font-medium">
                              {bullet}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                className={`p-5 rounded-2xl border shadow-3xs max-w-[85%] w-full whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-blue-600 border-blue-700 text-white shadow-sm max-w-fit"
                    : "bg-white border-slate-100 shadow-3xs"
                }`}
              >
                {msg.sender === "user" ? (
                  /* 📊 ATOMIC LAYOUT SWAP: Segments telemetry metrics from user questions cleanly */
                  <div className="space-y-3.5 w-full text-left">
                    {msg.text.includes("INJECTED") ||
                    msg.text.includes("TELEMETRY") ||
                    msg.text.includes("•") ? (
                      (() => {
                        const lines = msg.text.split("\n");

                        // 1. Isolate and construct the telemetry block metrics view
                        const vitalsLines = lines.filter(
                          (line) =>
                            line.includes("INJECTED") ||
                            line.includes("TELEMETRY") ||
                            line.trim().startsWith("•"),
                        );

                        const vitalsBlock = vitalsLines
                          .join("\n")
                          .replace(
                            /\[SIMULATION INJECTED\]/gi,
                            "[PATIENT CLINICAL TELEMETRY]",
                          )
                          .replace(/🎛️/g, "📊")
                          .replace(/🎰/g, "📊");

                        // 2. 🌟 ATOMIC LOOKUP CONTEXT ENGINE: Checks all message variables to bypass hardcoded lines
                        let activeInquiry = "";
                        if (msg.query) activeInquiry = msg.query;
                        else if (msg.question) activeInquiry = msg.question;
                        else if (msg.prompt) activeInquiry = msg.prompt;
                        else if (msg.input) activeInquiry = msg.input;

                        // Look ahead to capture the query from the corresponding assistant message state
                        if (
                          !activeInquiry &&
                          messages[idx + 1] &&
                          messages[idx + 1].sender === "agent"
                        ) {
                          const associatedAgent = messages[idx + 1];
                          if (associatedAgent.question)
                            activeInquiry = associatedAgent.question;
                          else if (associatedAgent.query)
                            activeInquiry = associatedAgent.query;
                        }

                        // Execute custom line string subtraction to isolate custom inputs text line dynamically
                        if (!activeInquiry) {
                          const cleanQueryLines = lines.filter((line) => {
                            const cleanLine = line.trim();
                            return (
                              cleanLine &&
                              !cleanLine.includes("INJECTED") &&
                              !cleanLine.includes("TELEMETRY") &&
                              !cleanLine.startsWith("•") &&
                              !cleanLine.startsWith("📊") &&
                              !cleanLine.startsWith("🎰") &&
                              !cleanLine.startsWith("🎛️") &&
                              !cleanLine
                                .toLowerCase()
                                .includes("active clinical inquiry") &&
                              !cleanLine
                                .toLowerCase()
                                .includes("analyze patient parameters against")
                            );
                          });
                          activeInquiry = cleanQueryLines.join(" ").trim();
                        }

                        // Clean, high-fidelity default banner if a simple metric slide action was fired with no text
                        if (!activeInquiry) {
                          activeInquiry =
                            "Executing automated guideline repository screening mapping indices...";
                        }

                        return (
                          <>
                            {/* 📊 Matrix Vitals Dashboard Node */}
                            <div className="text-xs font-semibold leading-relaxed tracking-wide text-white/95 whitespace-pre-wrap">
                              {vitalsBlock}
                            </div>

                            {/* 🔍 Isolated User Question Prompt Viewport */}
                            <div className="border-t border-white/20 pt-2.5 mt-1">
                              <span className="text-[9px] uppercase tracking-widest text-blue-200 font-bold block mb-1">
                                Active Clinical Inquiry
                              </span>
                              <p className="text-xs font-semibold text-white bg-blue-700/40 p-2.5 rounded-xl border border-blue-500/20">
                                {activeInquiry}
                              </p>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      /* Fallback Standard Text Question Layout Container */
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-widest text-blue-200 font-bold block">
                          Active Clinical Inquiry
                        </span>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  renderAgentPayload(msg.text)
                )}
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
