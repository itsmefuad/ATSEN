import { Route, Routes, Navigate } from "react-router";
import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";
import Yuvraj_Announcements from "./pages/yuvraj_Announcements.jsx";
import Yuvraj_AnnouncementDetail from "./pages/yuvraj_AnnouncementDetail.jsx";
import Yuvraj_AnnouncementEditor from "./pages/yuvraj_AnnouncementEditor.jsx";
import toast from "react-hot-toast";

const App = () => {
  return (
    <div data-theme="nord">
      <Routes>
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/create/room" element={<T_CreateRoom />} />
        <Route path="/teacher/room/:id" element={<T_Room />} />
        <Route path="/yuvraj/announcements" element={<Yuvraj_Announcements />} />
        <Route path="/yuvraj/announcements/:id" element={<Yuvraj_AnnouncementDetail />} />
        <Route path="/yuvraj/admin/announcements/:id" element={<Yuvraj_AnnouncementEditor />} />
      </Routes>
    </div>
  );
};
export default App;
