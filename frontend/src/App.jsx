import React from "react";
import { Routes, Route } from "react-router";

import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import I_Dashboard from "./pages/institution/I_Dashboard.jsx";
import InstitutionRooms from "./pages/institution/InstitutionRooms.jsx";
import AddRoom from "./pages/institution/AddRoom.jsx";
import StudentList from "./pages/institution/StudentList.jsx";
//import AddStudent         from "./pages/institution/AddStudent.jsx";
import InstructorList from "./pages/institution/InstructorList.jsx";
//import AddInstructor      from "./pages/institution/AddInstructor.jsx";
import InstitutionSettings from "./pages/institution/InstitutionSettings";

import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";

import S_Room from "./pages/student/S_Room.jsx";

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
          <Route path="/:idOrName/settings" element={<InstitutionSettings />} />
        </Route>

                        {/* Teacher routes */}
                <Route path="/teacher/dashboard" element={<T_Dashboard />} />
                <Route path="/teacher/create/room" element={<T_CreateRoom />} />
                <Route path="/teacher/room/:id/forum" element={<T_Room />} />
                <Route path="/teacher/edit/room/:id/edit" element={<T_Room />} />
                {/* Redirect old URL to new forum URL for backward compatibility */}
                <Route path="/teacher/edit/room/:id" element={<T_Room />} />

                {/* Student routes */}
                <Route path="/student/room/:id" element={<S_Room />} />

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={<p>Page not found: {window.location.pathname}</p>}
        />
      </Routes>
    </div>
  );
}
