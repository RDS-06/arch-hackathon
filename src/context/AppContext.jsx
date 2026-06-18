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

      // 🟢 FIXED: Isolates the LLM response card and cleanly segments references into their own distinct cards below
      i; // 🔮 PREMIUM PRESENTATION ARCHITECTURE: Matches the high-fidelity dashboard layout
      if (typeof rawResults === "string") {
        const parts = rawResults.split("|||CHUNK_SPLIT|||");

        // 1. Process the main clinical response card using the standard sanitizer
        let structuredReply = sanitizeText(parts[0]);

        // 2. Extract and isolate the top 2 reference chunks
        const topReferences = parts
          .slice(1)
          .filter((chunk) => chunk.trim())
          .slice(0, 2);

        if (topReferences.length > 0) {
          // Prepend with a clean break line that belongs to its own card row
          structuredReply += "\n• 📑 VERIFIED INGESTED REFERENCE GROUND TRUTH";

          topReferences.forEach((chunk, index) => {
            // Clean out ugly backend syntax markers and flatten the text string completely
            let cleanChunk = chunk
              .replace("📄 VERIFIED REFERENCE BASE", "")
              .replace(/SOURCE:/gi, "")
              .replace(/Segment Extract:/gi, "")
              .replace(/\r?\n/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            // Extract filename if present to build a clean title tracker
            let fileNameLabel = "CORE CLINICAL SOURCE TEXT";
            const fileMatch = cleanChunk.match(
              /([a-zA-Z0-9_\-]+\.(?:txt|pdf|csv))/i,
            );
            if (fileMatch) {
              fileNameLabel = fileMatch[1].toUpperCase();
              cleanChunk = cleanChunk.replace(fileMatch[0], "").trim();
            }

            if (cleanChunk.length > 240) {
              cleanChunk =
                cleanChunk.substring(0, 240) + "... [Truncated for Display]";
            }

            // 🟣 PREMIUM STRUCTURAL INJECTION: Merges title and body into unified cards
            structuredReply += `\n• 🟣 INGESTED VECTOR EXTRACT BASE #${index + 1}\n▫️ SOURCE FILE: ${fileNameLabel}\n▫️ EXTRACT: ${cleanChunk}\n`;
          });
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
