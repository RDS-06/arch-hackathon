import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

function Message({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex gap-4 items-start w-full transition-all duration-300 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Left-Side AI Profile Avatar */}
      {!isUser && (
        <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shrink-0 rounded-xl border border-blue-100 shadow-xs">
          <Bot size={18} />
        </div>
      )}

      {/* Core Message Bubble Box */}
      <div
        className={`p-4 max-w-xl rounded-2xl text-sm leading-relaxed shadow-xs transition-all border ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border-blue-700"
            : "bg-white text-slate-800 rounded-tl-none border-slate-100"
        }`}
      >
        {/* ReactMarkdown processes bold tokens, lists, and line breaks automatically */}
        <div
          className={`prose prose-sm max-w-none ${isUser ? "text-white font-medium" : "text-slate-700"}`}
        >
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => (
                <p className="mb-1 last:mb-0" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-4 my-1 space-y-0.5" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-4 my-1 space-y-0.5" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-xs sm:text-sm" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong
                  className={`font-bold ${isUser ? "text-white" : "text-slate-900"}`}
                  {...props}
                />
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>

      {/* Right-Side User Profile Avatar */}
      {isUser && (
        <div className="p-2.5 bg-slate-900 text-slate-100 shrink-0 rounded-xl shadow-xs border border-slate-800">
          <User size={18} />
        </div>
      )}
    </div>
  );
}

export default Message;
