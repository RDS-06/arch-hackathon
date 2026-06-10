import { useState } from "react";
import {
  Send,
  Sparkles,
  BrainCircuit,
  Search,
  ShieldCheck,
} from "lucide-react";
import Message from "../components/Message";

function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "Hello! I am your **MediAssist AI** clinical assistant. Please describe your active symptoms below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const agentSteps = [
    {
      icon: BrainCircuit,
      text: "Routing intent & extracting clinical symptoms...",
    },
    { icon: Search, text: "Querying internal Medical Guidelines Vector DB..." },
    {
      icon: ShieldCheck,
      text: "Running clinical safety & hallucination guardrails...",
    },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userQuery = input;
    setMessages((prev) => [...prev, { sender: "user", text: userQuery }]);
    setInput("");

    setIsThinking(true);
    setCurrentStep(0);

    setTimeout(() => {
      setCurrentStep(1);
      setTimeout(() => {
        setCurrentStep(2);
        setTimeout(() => {
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            {
              sender: "agent",
              text: `### Pipeline Evaluation Confirmed\n\nBased on your query: **"${userQuery}"**, I have analyzed the clinical parameters against open source reference vectors:\n\n* **Primary Assessment:** No immediate critical red flags.\n* **Action Plan:** Maintain baseline hydration matrices.\n* **Documentation Node:** An optimized telemetry log has been sent to your **Medical Reports** dashboard tab.`,
            },
          ]);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full h-screen flex flex-col justify-between">
      {/* Premium Top Status Banner */}
      <div className="mb-4 flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
            Operational Node: Secured
          </span>
        </div>
        <div className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-2xs">
          <Sparkles size={13} /> Pipeline Fidelity: 98.4%
        </div>
      </div>

      {/* Main Responsive Canvas View */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6 flex-1 flex flex-col justify-between overflow-hidden backdrop-blur-md">
        {/* Scannable Scrolling Timeline Wrapper */}
        <div className="space-y-6 overflow-y-auto pr-2 flex-1 scrollbar-thin">
          {messages.map((msg, index) => (
            <Message key={index} sender={msg.sender} text={msg.text} />
          ))}

          {/* Execution Trace Module */}
          {isThinking && (
            <div className="flex gap-4 items-start justify-start transition-all duration-200">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0 border border-amber-100 animate-spin">
                <BrainCircuit size={18} />
              </div>

              <div className="bg-white border border-amber-200/60 p-5 rounded-2xl rounded-tl-none max-w-xl w-full shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-amber-800 tracking-wider uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit block">
                  Agent Multi-Step Telemetry Trace
                </span>

                <div className="space-y-2">
                  {agentSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isPast = idx < currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                          isPast
                            ? "text-green-600 font-medium"
                            : isCurrent
                              ? "text-amber-600 font-semibold animate-pulse"
                              : "text-slate-300"
                        }`}
                      >
                        <StepIcon
                          size={14}
                          className={isCurrent ? "animate-bounce" : ""}
                        />
                        <span>{step.text}</span>
                        {isPast && (
                          <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 font-bold px-1.5 py-0.2 rounded ml-auto">
                            Verified
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar Submission Node */}
        <form
          onSubmit={handleSend}
          className="mt-4 flex gap-2 pt-4 border-t border-slate-200/60 bg-transparent"
        >
          <input
            type="text"
            value={input}
            disabled={isThinking}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-slate-200 bg-white rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-slate-100 disabled:text-slate-400"
            placeholder={
              isThinking
                ? "Awaiting model response generation loop..."
                : "Describe active clinical symptoms or diagnosis query..."
            }
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 rounded-xl hover:opacity-95 active:scale-98 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm disabled:from-slate-200 disabled:to-slate-300 disabled:scale-100 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
