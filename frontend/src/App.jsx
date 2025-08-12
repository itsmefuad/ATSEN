import { Route, Routes, Navigate } from "react-router";
import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_Classroom from "./pages/teacher/T_Classroom.jsx";
import Yuvraj_Announcements from "./pages/yuvraj_Announcements.jsx";
import Yuvraj_AnnouncementDetail from "./pages/yuvraj_AnnouncementDetail.jsx";
import Yuvraj_AnnouncementEditor from "./pages/yuvraj_AnnouncementEditor.jsx";

const App = () => {
  return (
    <div data-theme="nord">
      <Routes>
        {/* Existing teacher routes */}
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/classroom/:id" element={<T_Classroom />} />

        {/* Yuvraj-announcements feature */}
        <Route path="/yuvraj/announcements" element={<Yuvraj_Announcements />} />
        <Route path="/yuvraj/announcements/:id" element={<Yuvraj_AnnouncementDetail />} />
        <Route path="/yuvraj/admin/announcements/:id" element={<Yuvraj_AnnouncementEditor />} />

        {/* Default route for quick access during demo */}
        <Route path="/" element={<Navigate to="/yuvraj/announcements" replace />} />
      </Routes>
    </div>
  );
};
export default App;
