import { useApp } from "../context/AppContext";
import {
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export default function Report() {
  const { liveDashboardData, auditTrail, messages } = useApp();

  // Find the last agent response to parse out the source citations block dynamically
  const lastAgentMessage = [...messages]
    .reverse()
    .find(
      (msg) => msg.sender === "agent" && msg.text.includes("|||CHUNK_SPLIT|||"),
    );

  let citationsArray = [];
  if (lastAgentMessage) {
    const segments = lastAgentMessage.text.split("|||CHUNK_SPLIT|||");
    citationsArray = segments.slice(1); // Isolate the reference blocks
  }

  const normalCondition = liveDashboardData.primary_condition
    ? liveDashboardData.primary_condition.toLowerCase()
    : "";
  let icdCode = "ICD-10-GEN";
  let themeColor = "border-slate-200 bg-slate-50 text-slate-900";

  if (normalCondition.includes("asthma")) {
    icdCode = "ICD-10-J45";
    themeColor = "border-amber-200 bg-amber-50 text-amber-900";
  } else if (normalCondition.includes("diabetes")) {
    icdCode = "ICD-10-E11";
    themeColor = "border-red-200 bg-red-50 text-red-900";
  } else if (
    normalCondition.includes("heart") ||
    normalCondition.includes("chf")
  ) {
    icdCode = "ICD-11-BD10";
    themeColor = "border-blue-200 bg-blue-50 text-blue-900";
  }

  if (liveDashboardData.risk_status === "HIGH") {
    themeColor = "border-red-200 bg-red-50 text-red-900 animate-pulse";
  }

  // Graceful empty state tracker if no evaluation has run yet
  if (
    !liveDashboardData ||
    (liveDashboardData.primary_condition === "Unknown" && messages.length <= 1)
  ) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <FileSpreadsheet
          size={48}
          className="text-slate-300 animate-pulse mb-3"
        />
        <h3 className="text-sm font-bold text-slate-700">
          Analytical Vault Inactive
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
          Please configure patient metrics and execute an agent look-up within
          the Chat terminal first to compile data parameters here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* 1. STRUCTURAL CASE FOCUS HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-6 rounded-3xl shadow-2xs gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">
              {icdCode}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Dynamic Decision Summary Profile Sheet
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {liveDashboardData.primary_condition} Clinical Profile Report
          </h1>
        </div>
        <div
          className={`flex items-center gap-2 border px-4 py-2 rounded-2xl font-semibold text-xs ${themeColor}`}
        >
          <AlertTriangle size={16} />
          <span>Triage Level: {liveDashboardData.risk_status}</span>
        </div>
      </div>

      {/* 2. EXCLUSIVE FULL-WIDTH AUDIT MATRIX INFRASTRUCTURE */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-50 text-slate-800">
          <ShieldCheck size={18} className="text-green-600" />
          <h3 className="text-sm font-bold tracking-tight">
            Zero-Trust Hallucination Audit Matrix
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                <th className="p-4 pl-6">Extracted AI Clinical Claim</th>
                <th className="p-4">Source Allocation Anchor</th>
                <th className="p-4 pr-6 text-center">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {auditTrail && auditTrail.length > 0 ? (
                auditTrail.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/40 transition">
                    <td className="p-4 pl-6 max-w-[420px] leading-relaxed font-semibold text-slate-800">
                      {log.claim}
                    </td>
                    <td className="p-4 font-mono text-blue-600">
                      <span className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                        {log.source}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div
                        className={`mx-auto w-fit flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold ${
                          log.status === "VERIFIED"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {log.status === "VERIFIED" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        <span>{log.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center p-8 text-slate-400 italic"
                  >
                    No validation loops executed. Submit a parameters token
                    package in the chat console to compile audit data tables.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CORE CLINICAL DIRECTIVES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Safety Boundaries */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <ShieldAlert className="text-amber-600" size={18} />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Active Safety Boundaries
            </h2>
          </div>
          <div className="space-y-3">
            {liveDashboardData.vitals_critical_thresholds?.map((metric, i) => (
              <div
                key={i}
                className="text-xs flex items-start gap-2 text-slate-600 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{metric}</span>
              </div>
            )) || (
              <p className="text-xs text-slate-400 italic">
                No boundaries logged.
              </p>
            )}
          </div>
        </div>

        {/* Pharmacotherapy Directives */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <ClipboardList className="text-emerald-600" size={18} />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Pharmacotherapy Directives
            </h2>
          </div>
          <div className="space-y-4">
            {liveDashboardData.recommended_medications?.map((med, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Dynamic Order #{i + 1}
                </span>
                <p className="text-xs bg-emerald-50/60 border border-emerald-100/50 text-emerald-950 p-2.5 rounded-xl font-medium leading-relaxed">
                  {med}
                </p>
              </div>
            )) || (
              <p className="text-xs text-slate-400 italic">
                No target prescriptions compiled.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. GROUND TRUTH SOURCE CITATION VAULT BLOCK */}
      {citationsArray.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <FileText size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider text-xs text-purple-400">
              Ingested Guideline Reference Base Chunks
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {citationsArray.map((chunk, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 leading-relaxed font-medium"
              >
                <span className="text-[10px] font-bold text-blue-400 block mb-1.5 uppercase tracking-widest">
                  📄 Database Source Record Vector #{idx + 1}
                </span>
                {chunk
                  .replace(/📄\s*VERIFIED\s*MINISTRY\s*CITATION\s*#\d+/gi, "")
                  .trim()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
