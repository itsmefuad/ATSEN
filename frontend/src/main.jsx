import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";

// Set default institution in localStorage
try {
  const existingInstitution = localStorage.getItem('yuvraj_institution');
  if (!existingInstitution) {
    localStorage.setItem('yuvraj_institution', 'Brac University');
  }
} catch (e) {
  console.warn('Failed to set default institution:', e);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
