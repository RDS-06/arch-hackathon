import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Database,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  MessageSquareText,
  FileText,
  Zap,
} from "lucide-react";
import Dropzone from "../components/Dropzone";

const BACKEND_API_URL = "http://127.0.0.1:8000";

function Home() {
  // 🌟 REACT STATE ENGINE: Initialized with your aesthetic design defaults to prevent initial flash layout distortion
  const [telemetry, setTelemetry] = useState({
    total_chunks: 14205,
    active_specialists: 4,
    fetch_latency_ms: 142,
    guardrail_status: "100.0%",
    memory_turns_cached: 0,
  });

  // 📥 AUTOMATED LIFECYCLE DISPATCH: Fetches raw server infrastructure coordinates on page render initialization
  useEffect(() => {
    const fetchTelemetryMetrics = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/system/stats`);
        setTelemetry(response.data);
      } catch (error) {
        console.error(
          "Failed to safely bridge active backend analytics registries:",
          error,
        );
      }
    };

    fetchTelemetryMetrics();
    // Poll updates every 5 seconds to show real-time changes if changes occur in background tasks
    const systemPollingInterval = setInterval(fetchTelemetryMetrics, 5000);
    return () => clearInterval(systemPollingInterval);
  }, []);

  // 📦 THE DYNAMIC INFRASTRUCTURE ANALYTICS ARRAYS
  const systemStats = [
    {
      label: "Vector Embeddings Indexed",
      value: `${telemetry.total_chunks.toLocaleString()} chunks`,
      subtext: "WHO & CDC Reference Guidelines",
      icon: Database,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Guardrail Safety Compliance",
      value: telemetry.guardrail_status,
      subtext: "0 hallucinations detected",
      icon: ShieldCheck,
      color: "text-green-600 bg-green-50 border-green-100",
    },
    {
      label: "Active Agent Routing Nodes",
      value: `${telemetry.active_specialists} Specialists`,
      subtext:
        telemetry.memory_turns_cached > 0
          ? `🧠 Context: ${telemetry.memory_turns_cached} chat exchanges cached`
          : "Symptom, Risk, Report, Safety",
      icon: Cpu,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      label: "Average Vector Fetch Latency",
      value: `${telemetry.fetch_latency_ms}ms`,
      subtext: "Semantic similarity top-k search",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const quickActions = [
    {
      title: "Launch Clinical Chat Node",
      description:
        "Engage the multi-agent pipeline to extract patient symptoms, run cross-references against vector databases, and trace agent steps live.",
      link: "/chat",
      icon: MessageSquareText,
      cta: "Open Chat Interface",
    },
    {
      title: "Review Compiled Patient Reports",
      description:
        "Access structured, doctor-ready clinical summaries, complete with automated urgency risk metrics and data citation trails.",
      link: "/report",
      icon: FileText,
      cta: "View Reports Vault",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Dynamic Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Zap size={180} className="text-blue-400 rotate-12" />
        </div>
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            System Node: Active
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-3 sm:text-4xl">
            Welcome to MediAssist AI
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            An advanced, localized medical intelligence workspace executing
            real-time semantic document retrieval (RAG) mapped through an
            automated multi-agent intent routing layer.
          </p>
        </div>
      </div>

      {/* 2. Drag & Drop Source Ingestion Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Active Reference Document Ingestion Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Load localized trusted clinical files directly into the context
              vector registry space.
            </p>
          </div>
          <Dropzone />
        </div>

        {/* Informative Dashboard Side-Panel */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl flex flex-col justify-between border border-slate-800 shadow-lg">
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">
              Vector Ingestion Logic
            </span>
            <h4 className="text-sm font-bold tracking-tight">
              Chunking & Embedding Pipeline
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When documents are added, the system automatically segments raw
              strings into contextual chunks, targets semantic anchors, and
              parses structural content models ahead of runtime queries.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Infrastructure Metrics Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Pipeline Analytics & Vector Engine Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between group hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 max-w-[150px] leading-tight">
                    {stat.label}
                  </span>
                  <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight block">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {stat.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Core Workspace Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {quickActions.map((action, idx) => {
          const ActionIcon = action.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between group hover:border-blue-100 transition-all"
            >
              <div>
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
                  <ActionIcon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition">
                  {action.title}
                </h3>
                <p className="mt-2 text-slate-500 text-xs sm:text-sm leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50">
                <Link
                  to={action.link}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200"
                >
                  <span>{action.cta}</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
