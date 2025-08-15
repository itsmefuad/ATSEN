// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import InstitutionLayout from "./pages/institution/InstitutionLayout.jsx";
import I_Dashboard       from "./pages/institution/I_Dashboard.jsx";
import AddRoom           from "./pages/institution/addRoom.jsx";
import InstitutionRooms  from "./pages/institution/InstitutionRooms.jsx";

import T_Dashboard   from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom  from "./pages/teacher/T_CreateRoom.jsx";
import T_Room        from "./pages/teacher/T_Room.jsx";

export default function App() {
  return (
    <div data-theme="nord">
      <Routes>
        <Route path="/:idOrName" element={<InstitutionLayout />}>
          <Route index element={<I_Dashboard />} />
          <Route path="dashboard" element={<I_Dashboard />} />
          <Route path="add_room" element={<AddRoom />} />
          <Route path="rooms" element={<InstitutionRooms />} />
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/create/room" element={<T_CreateRoom />} />
        <Route path="/teacher/room/:id" element={<T_Room />} />

        {/* Fallback */}
        <Route
          path="*"
          element={<p>Page not found: {window.location.pathname}</p>}
        />
      </Routes>
    </div>
  );
}