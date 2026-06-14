import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext"; // Import Provider
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppProvider>
      {" "}
      {/* Wrap context frame */}
      <App />
    </AppProvider>
  </BrowserRouter>,
);
