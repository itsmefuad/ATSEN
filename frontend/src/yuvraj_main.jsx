import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Yuvraj_Announcements from "./pages/yuvraj_Announcements.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div data-theme="nord">
      <Yuvraj_Announcements />
    </div>
  </StrictMode>
);


