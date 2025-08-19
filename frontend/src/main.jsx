import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { yuvrajGetInstitution, yuvrajSetInstitution } from "./services/yuvraj_auth.js";

// Ensure a default institution exists in localStorage so pages and API clients
// that read `yuvraj_institution` get a predictable value immediately.
try {
  const inst = yuvrajGetInstitution();
  yuvrajSetInstitution(inst);
} catch (e) {}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
