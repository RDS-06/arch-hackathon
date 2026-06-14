import { createContext, useState, useContext } from "react";
import axios from "axios";

const AppContext = createContext();
const BACKEND_API_URL = "http://127.0.0.1:8000";

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

  // 🌟 NEW STATE LAYERS FOR ZERO-TRUST COMPLIANCE MATRIX
  const [auditTrail, setAuditTrail] = useState([]);

  const [liveDashboardData, setLiveDashboardData] = useState({
    primary_condition: "Unknown",
    risk_status: "LOW",
    vitals_critical_thresholds: ["Awaiting diagnostic evaluation context..."],
    recommended_medications: [],
    differential_diagnoses: [],
  });

  const sendUserPrompt = async (promptText, simulatorPayload = null) => {
    if (!promptText.trim()) return;

    // 🌟 THE SEPARATION BRIDGE: Create a clear visual boundary in the chat view
    if (!simulatorPayload) {
      setMessages((prev) => [...prev, { sender: "user", text: promptText }]);
    } else {
      // If a slider simulation is triggered, inject an automated data-badge bubble
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `🎛️ [SIMULATION INJECTED]\n• Age: ${simulatorPayload.age} yrs\n• Weight: ${simulatorPayload.weight} kg\n• Creatinine: ${simulatorPayload.creatinine} mg/dL\n• Systolic BP: ${simulatorPayload.bp_sys} mmHg`,
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
        simulator_vitals: simulatorPayload, // Routes slider parameters safely
      });

      clearInterval(traceInterval);
      setIsThinking(false);

      if (response.data.report_metrics) {
        setLiveDashboardData(response.data.report_metrics);
      }

      // 🌟 STREAM IN THE ACTIVE SECURITY LOGS
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

      if (typeof rawResults === "string") {
        parsedReply = sanitizeText(rawResults);
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
      console.error(error);
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
        auditTrail, // 🌟 EXPOSED LOGS
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
