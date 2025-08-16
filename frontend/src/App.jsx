import React from "react";
import { Routes, Route, Navigate } from "react-router";

import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import I_Dashboard from "./pages/institution/I_Dashboard.jsx";
import InstitutionRooms from "./pages/institution/InstitutionRooms.jsx";
import AddRoom from "./pages/institution/addRoom.jsx";
import StudentList from "./pages/institution/StudentList.jsx";
//import AddStudent         from "./pages/institution/AddStudent.jsx";
import InstructorList from "./pages/institution/InstructorList.jsx";
//import AddInstructor      from "./pages/institution/AddInstructor.jsx";
import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";
import Yuvraj_Announcements from "./pages/yuvraj_Announcements.jsx";
import Yuvraj_AnnouncementDetail from "./pages/yuvraj_AnnouncementDetail.jsx";
import Yuvraj_AnnouncementEditor from "./pages/yuvraj_AnnouncementEditor.jsx";

export default function App() {
  return (
    <div data-theme="nord">
      <Routes>
        {/* Institution routes */}
        <Route path="/:idOrName" element={<InstitutionLayout />}>
          <Route index element={<I_Dashboard />} />
          <Route path="dashboard" element={<I_Dashboard />} />

          <Route path="rooms" element={<InstitutionRooms />} />
          <Route path="add-room" element={<AddRoom />} />

          <Route path="students" element={<StudentList />} />

          <Route path="instructors" element={<InstructorList />} />
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/create/room" element={<T_CreateRoom />} />
        <Route path="/teacher/edit/room/:id" element={<T_Room />} />
        <Route path="/yuvraj/announcements" element={<Yuvraj_Announcements />} />
        <Route path="/yuvraj/announcements/:id" element={<Yuvraj_AnnouncementDetail />} />
        <Route path="/yuvraj/admin/announcements/:id" element={<Yuvraj_AnnouncementEditor />} />

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={<p>Page not found: {window.location.pathname}</p>}
        />
      </Routes>
    </div>
  );
}
