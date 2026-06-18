import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();

const BACKEND_API_URL = import.meta.env.PROD
  ? "https://arch-hackathon.onrender.com"
  : "http://127.0.0.1:8000";

export function AppProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "Hello! The live data node is active. Please describe your symptoms or paste clinical notes.",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);

  const [liveDashboardData, setLiveDashboardData] = useState({
    primary_condition: "Unknown",
    risk_status: "LOW",
    vitals_critical_thresholds: ["Awaiting diagnostic evaluation context..."],
    recommended_medications: [],
    differential_diagnoses: [],
  });

  const resetContext = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setMessages([
          {
            sender: "agent",
            text: "Hello! The live data node is active. Please describe your symptoms or paste clinical notes.",
          },
        ]);
        setAuditTrail([]);
        setLiveDashboardData({
          primary_condition: "Unknown",
          risk_status: "LOW",
          vitals_critical_thresholds: [
            "Awaiting diagnostic evaluation context...",
          ],
          recommended_medications: [],
          differential_diagnoses: [],
        });
      }
    } catch (error) {
      console.error("Failed to clear telemetry context registry:", error);
    }
  };

  useEffect(() => {
    resetContext();
  }, []);

  const sendUserPrompt = async (promptText, simulatorPayload = null) => {
    if (!promptText.trim()) return;

    if (!simulatorPayload) {
      setMessages((prev) => [...prev, { sender: "user", text: promptText }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `🎛️ [SIMULATION INJECTED]\n• Age: ${simulatorPayload.age} yrs\n• Weight: ${simulatorPayload.weight} kg\n• Creatinine: ${simulatorPayload.creatinine} mg/dL\n• Systolic BP: ${simulatorPayload.bp_sys} mmHg`,
          query: promptText,
        },
      ]);
    }

    setIsThinking(true);
    setCurrentStep(0);

    const traceInterval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep < 2 ? prevStep + 1 : prevStep));
    }, 1000);

    try {
      const response = await axios.post(`${BACKEND_API_URL}/ask`, {
        question: promptText,
        simulator_vitals: simulatorPayload,
      });

      clearInterval(traceInterval);
      setIsThinking(false);

      if (response.data.report_metrics) {
        setLiveDashboardData(response.data.report_metrics);
      }

      if (response.data.audit_trail) {
        setAuditTrail(response.data.audit_trail);
      }

      const rawResults = response.data.results;
      let parsedReply = "";

      const sanitizeText = (text) => {
        if (!text) return "";
        return text
          .replace(/(?:\s|^)z\s+z\s+/gi, " • ")
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .replace(/•/g, "\n• ")
          .replace(
            /(LIFESTYLE MODIFICATION|MONITORING OF HYPERTENSION|HYPERTENSION URGENCY|DIABETES PHARMACOTHERAPY|TRY AND RULE OUT|GUIDING PRINCIPLES|DISEASE EXACERBATION|INITIAL EVALUATION PARAMETERS|DIFFERENTIAL DIAGNOSIS|DIAGNOSTIC THRESHOLDS|EXCLUSION PARAMETERS|REFERRAL PARAMETERS)/gi,
            "\n\n$1\n",
          )
          .trim();
      };

      // 🔮 UNBREAKABLE UNICODE BREAKOUT LOGIC
      if (typeof rawResults === "string") {
        let primaryContent = rawResults;
        let base1 = "";
        let base2 = "";

        if (rawResults.includes("VERIFIED_REFERENCE_DIVIDER")) {
          const mainSplit = rawResults.split("VERIFIED_REFERENCE_DIVIDER");
          primaryContent = mainSplit[0];
          const refContent = mainSplit[1] || "";

          if (refContent.includes("INGESTED_VECTOR_BASE|||1|||")) {
            const baseSplit1 = refContent.split("INGESTED_VECTOR_BASE|||1|||");
            const remainder = baseSplit1[1] || "";
            const baseSplit2 = remainder.split("INGESTED_VECTOR_BASE|||2|||");
            base1 = baseSplit2[0] || "";
            base2 = baseSplit2[1] || "";
          }
        } else if (rawResults.includes("|||CHUNK_SPLIT|||")) {
          const parts = rawResults.split("|||CHUNK_SPLIT|||");
          primaryContent = parts[0];
          base1 = parts[1] || "";
          base2 = parts[2] || "";
        }

        const cleanRefText = (text) => {
          if (!text) return "";
          return text
            .replace(/SOURCE:\s*[a-zA-Z0-9_\-]+\.(?:txt|pdf|csv)/gi, "")
            .replace(/[a-zA-Z0-9_\-]+\.(?:txt|pdf|csv)/gi, "")
            .replace(/VERIFIED REFERENCE BASE/gi, "")
            .replace(/SOURCE:/gi, "")
            .replace(/EXTRACT:/gi, "")
            .replace(/Segment Extract:/gi, "")
            .replace(/\|/g, "")
            .replace(/•/g, "")
            .replace(/\r?\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        };

        base1 = cleanRefText(base1);
        base2 = cleanRefText(base2);

        let structuredReply = sanitizeText(primaryContent);

        if (base1 || base2) {
          // 🟣 THE SECRET WEAPON: \u2028 creates structural line drops inside the card container without triggering list splits
          const BR = "\u2028";

          structuredReply += `${BR}${BR}────────────────────────────────────────────────────────────${BR}📋 VERIFIED INGESTED REFERENCE GROUND TRUTH${BR}`;

          if (base1) {
            structuredReply += `${BR}🟣 INGESTED VECTOR EXTRACT BASE #1${BR}${BR}${base1}${BR}`;
          }
          if (base2) {
            structuredReply += `${BR}🟣 INGESTED VECTOR EXTRACT BASE #2${BR}${BR}${base2}`;
          }
        }

        parsedReply = structuredReply;
      } else if (Array.isArray(rawResults)) {
        if (rawResults.length === 0) {
          parsedReply = "⚠️ No matching references discovered.";
        } else {
          parsedReply = rawResults
            .map((chunk) =>
              sanitizeText(
                chunk.page_content ||
                  chunk.text ||
                  (typeof chunk === "string" ? chunk : ""),
              ),
            )
            .join("|||CHUNK_SPLIT|||");
        }
      }

      setMessages((prev) => [...prev, { sender: "agent", text: parsedReply }]);
    } catch (error) {
      clearInterval(traceInterval);
      setIsThinking(false);
      console.error(
        "Critical network handshake interrupted inside context:",
        error,
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "⚠️ Server response timed out. Please verify your Python backend port bindings are active and try again.",
        },
      ]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        messages,
        isThinking,
        currentStep,
        uploadedFiles,
        setUploadedFiles,
        sendUserPrompt,
        liveDashboardData,
        setLiveDashboardData,
        auditTrail,
        resetContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
