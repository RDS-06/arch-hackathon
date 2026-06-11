import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Report from "./pages/Report";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      {/* Fixed Left Navigation Panel */}
      <Sidebar />

      {/* Dynamic Right Content Workspace */}
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
