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

      // ── Cleans a reference chunk into a flat, readable paragraph ──────────
      const cleanReferenceChunk = (chunk) => {
        return chunk
          .replace("📄 VERIFIED REFERENCE BASE", "")
          .replace(/SOURCE:\s*[a-zA-Z0-9_\-]+\.(?:txt|pdf|csv)/gi, "")
          .replace(/SOURCE:/gi, "")
          .replace(/Segment Extract:/gi, "")
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .replace(/•/g, "")
          .trim();
      };

      // ── Preserves numbered/bulleted points in the main LLM response ───────
      const sanitizeMainResponse = (text) => {
        if (!text) return "";
        return (
          text
            // Fix malformed bullet sequences like "z z" → bullet
            .replace(/(?:\s|^)z\s+z\s+/gi, "\n• ")
            // Normalise Windows line endings
            .replace(/\r\n/g, "\n")
            // Insert line breaks before known section headers
            .replace(
              /(LIFESTYLE MODIFICATION|MONITORING OF HYPERTENSION|HYPERTENSION URGENCY|DIABETES PHARMACOTHERAPY|TRY AND RULE OUT|GUIDING PRINCIPLES|DISEASE EXACERBATION|INITIAL EVALUATION PARAMETERS|DIFFERENTIAL DIAGNOSIS|DIAGNOSTIC THRESHOLDS|EXCLUSION PARAMETERS|REFERRAL PARAMETERS)/gi,
              "\n\n$1\n",
            )
            // Ensure numbered list items start on their own line  e.g. "1." or "1)"
            .replace(/(\s)(\d+[\.\)])\s+/g, "\n$2 ")
            // Ensure bullet points start on their own line
            .replace(/(\s)(•|-)\s+/g, "\n$2 ")
            .trim()
        );
      };

      if (typeof rawResults === "string") {
        const parts = rawResults.split("|||CHUNK_SPLIT|||");

        // 1. Main clinical recommendation — keep points intact
        const mainResponse = sanitizeMainResponse(parts[0]);

        // 2. Reference chunks — clean and label like Image 2
        const referenceChunks = parts
          .slice(1)
          .filter((chunk) => chunk.trim())
          .slice(0, 2);

        let referencesBlock = "";
        if (referenceChunks.length > 0) {
          const formattedRefs = referenceChunks
            .map(
              (chunk, index) =>
                `INGESTED_VECTOR_BASE|||${index + 1}|||${cleanReferenceChunk(chunk)}`,
            )
            .join("\n");

          referencesBlock = `\n\nVERIFIED_REFERENCE_DIVIDER\n${formattedRefs}`;
        }

        parsedReply = mainResponse + referencesBlock;
      } else if (Array.isArray(rawResults)) {
        if (rawResults.length === 0) {
          parsedReply = "⚠️ No matching references discovered.";
        } else {
          parsedReply = rawResults
            .map((chunk) =>
              sanitizeMainResponse(
                chunk.page_content ||
                  chunk.text ||
                  (typeof chunk === "string" ? chunk : ""),
              ),
            )
            .join("\n\n");
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
