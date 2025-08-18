import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { yuvrajGetInstitution, yuvrajSetInstitution } from "./services/yuvraj_announcements.js";

// Ensure a default institution exists in localStorage so pages and API clients
// that read `yuvraj_institution` get a predictable value immediately.
try {
  const inst = yuvrajGetInstitution();
  yuvrajSetInstitution(inst);
} catch (e) {}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
