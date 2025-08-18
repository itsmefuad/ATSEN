// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Admin
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./pages/admin/ProtectedRoute";

// Auth
import Auth from "./pages/login/Auth.jsx";

// Institution
import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import I_Dashboard from "./pages/institution/I_Dashboard.jsx";
import InstitutionRooms from "./pages/institution/InstitutionRooms.jsx";
import AddRoom from "./pages/institution/AddRoom.jsx";
import AddInstructor from "./pages/institution/AddInstructor.jsx";
import StudentList from "./pages/institution/StudentList.jsx";
import InstructorList from "./pages/institution/InstructorList.jsx";
import InstitutionSettings from "./pages/institution/InstitutionSettings.jsx";

// Teacher
import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";

import S_Dashboard from "./pages/student/S_Dashboard.jsx";
import S_Room from "./pages/student/S_Room.jsx";

// Yuvraj Announcements
import Yuvraj_Announcements from "./pages/yuvraj_Announcements.jsx";
import Yuvraj_AnnouncementDetail from "./pages/yuvraj_AnnouncementDetail.jsx";
import Yuvraj_AnnouncementEditor from "./pages/yuvraj_AnnouncementEditor.jsx";
import TimelineDemo from "./components/room/TimelineDemo.jsx";

export default function App() {
  return (
    <div data-theme="nord">
      <Routes>
        {/* 1. Root redirect → /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. Auth (login/register) */}
        <Route path="/login" element={<Auth />} />

        {/* 3. Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 4. Dynamic Institution Routes */}
        <Route path="/:idOrName" element={<InstitutionLayout />}>
          {/* Dashboard */}
          <Route index element={<I_Dashboard />} />
          <Route path="dashboard" element={<I_Dashboard />} />

          {/* Rooms */}
          <Route path="rooms" element={<InstitutionRooms />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="add-instructor" element={<AddInstructor />} />

          {/* People */}
          <Route path="students" element={<StudentList />} />
          <Route path="instructors" element={<InstructorList />} />

          {/* Settings */}
          <Route path="settings" element={<InstitutionSettings />} />
        </Route>

        {/* 5. Teacher */}
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/create/room" element={<T_CreateRoom />} />
        <Route path="/teacher/room/:id/forum" element={<T_Room />} />
        <Route path="/teacher/room/:id/materials" element={<T_Room />} />
                <Route path="/teacher/room/:id/assessment" element={<T_Room />} />
        <Route path="/teacher/room/:id/edit" element={<T_Room />} />
        <Route path="/teacher/room/:id" element={<T_Room />} />
        <Route path="/teacher/edit/room/:id" element={<T_Room />} />

                {/* Student routes */}
                <Route path="/student/dashboard" element={<S_Dashboard />} />
                <Route path="/student/profile" element={<S_Profile />} />
                <Route path="/student/room/:id/forum" element={<S_Room />} />
                <Route path="/student/room/:id/materials" element={<S_Room />} />
                <Route path="/student/room/:id/assessment" element={<S_Room />} />
                {/* Redirect old URL to new forum URL for backward compatibility */}
                <Route path="/student/room/:id" element={<S_Room />} />
              <Route path="/teacher/edit/room/:id" element={<T_Room />} />
              <Route path="/yuvraj/announcements" element={<Yuvraj_Announcements />} />
              <Route path="/yuvraj/announcements/:id" element={<Yuvraj_AnnouncementDetail />} />
              <Route path="/yuvraj/admin/announcements/:id" element={<Yuvraj_AnnouncementEditor />} />
              
              {/* Demo route for timeline testing */}
              <Route path="/demo/timeline" element={<TimelineDemo />} />

        {/* 8. Catch-all 404 */}
        <Route
          path="*"
          element={<p>Page not found: {window.location.pathname}</p>}
        />
      </Routes>
    </div>
  );
}