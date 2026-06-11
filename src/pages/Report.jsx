import {
  FileText,
  Printer,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Calendar,
  UserCheck,
} from "lucide-react";

function Report() {
  // Mock data structure representing a complete pipeline audit trail
  const activeReport = {
    patientId: "PA-2026-8941",
    compiledAt: "June 11, 2026 - 00:08 UTC",
    symptoms: [
      "Acute Pyrexia (High Fever)",
      "Cephalea (Migraine/Headache)",
      "Mild Photophobia",
    ],
    riskAssessment: {
      level: "Medium Urgency",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      badgeColor: "bg-amber-500",
      summary:
        "Symptoms indicate systemic inflammatory response. Elevated temperature noted. Immediate critical emergency markers (chest pain, dyspnea) are currently absent, but monitoring is required.",
    },
    ragCitations: [
      {
        source: "WHO Clinical Guidelines v4.2",
        section: "Section 3: Acute Febrile Illness Management",
        confidence: "94.2%",
        snippet:
          "Patients presenting with acute pyrexia accompanied by secondary cephalea should be evaluated for systemic hydration levels and monitored for neurological changes.",
      },
      {
        source: "CDC Health Advisory Manual",
        section: "Chapter 11: Pyretic Assessment Matrix",
        confidence: "89.7%",
        snippet:
          "In the absence of severe respiratory distress, prioritize core temperature regulation and track secondary symptom presentation over a continuous 12-hour tracking window.",
      },
    ],
    clinicalDirectives: [
      "Administer baseline oral hydration (250ml fluids hourly).",
      "Log tympanic or oral temperature variations every 4 hours.",
      "Flag immediately for practitioner review if photophobia increases or neck stiffness develops.",
    ],
  };

  const handlePrint = () => {
    window.print(); // Simple, instant browser-native PDF/Print trigger
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6 animate-fade-in print:p-0">
      {/* Action Utility Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-xs print:hidden">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={14} />
          <span>
            Record Reference:{" "}
            <strong className="text-slate-700 font-semibold">
              {activeReport.patientId}
            </strong>
          </span>
        </div>
        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Printer size={14} />
          <span>Export Clinical PDF</span>
        </button>
      </div>

      {/* Main Report Body Canvas */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8 print:border-none print:shadow-none">
        {/* Report Header */}
        <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Automated Output Ledger
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <FileText className="text-blue-600" size={24} /> Clinical
              Intelligence Brief
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">
              Generated Matrix Framework
            </span>
            <span className="text-xs font-medium text-slate-700 block mt-0.5">
              {activeReport.compiledAt}
            </span>
          </div>
        </div>

        {/* --- SECTION 1: TRIAGE RISK METRIC --- */}
        <div
          className={`p-5 rounded-2xl border ${activeReport.riskAssessment.color} flex flex-col md:flex-row gap-4 items-start`}
        >
          <div className="flex items-center gap-2 mt-0.5 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${activeReport.riskAssessment.badgeColor} block`}
            ></span>
            <h3 className="font-bold text-sm tracking-wide uppercase">
              {activeReport.riskAssessment.level}
            </h3>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            {activeReport.riskAssessment.summary}
          </p>
        </div>

        {/* --- SECTION 2: EXTRACTED FEATURES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Identified Symptom Arrays
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeReport.symptoms.map((symptom, i) => (
                <span
                  key={i}
                  className="bg-slate-100 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200/40"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Validation Integrity Guard
            </h3>
            <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50/60 border border-green-100 px-3 py-2 rounded-xl w-fit">
              <UserCheck size={14} /> Medical Alignment Agent: Passed
              Verification
            </div>
          </div>
        </div>

        {/* --- SECTION 3: CORE CLINICAL DIRECTIVES --- */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Preliminary Action Directives
          </h3>
          <div className="space-y-2.5">
            {activeReport.clinicalDirectives.map((directive, i) => (
              <div
                key={i}
                className="flex gap-3 items-start text-xs sm:text-sm text-slate-700"
              >
                <CheckCircle
                  size={16}
                  className="text-blue-600 mt-0.5 shrink-0"
                />
                <p className="leading-normal">{directive}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 4: KNOWLEDGE BASE CITATION TRAILS (Winning RAG UI Component) --- */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              RAG Sourced Verification Trails
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Direct context mappings extracted from localized trusted medical
              database nodes.
            </p>
          </div>

          <div className="space-y-4">
            {activeReport.ragCitations.map((citation, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2.5 group hover:border-blue-100 transition duration-150"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span>{citation.source}</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span className="text-slate-500 font-medium">
                      {citation.section}
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2 py-0.5 rounded-md">
                    Match Confidence: {citation.confidence}
                  </span>
                </div>
                <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200/30 leading-relaxed relative">
                  "{citation.snippet}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
