// frontend/src/App.jsx
import { Routes, Route, Outlet } from "react-router";

import I_Dashboard from "./pages/institution/I_Dashboard.jsx";
import AddRoom     from "./pages/institution/AddRoom.jsx";

import T_Dashboard   from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom  from "./pages/teacher/T_CreateRoom.jsx";
import T_Room        from "./pages/teacher/T_Room.jsx";

function InstitutionLayout() {
  return (
    <div>
      {/* You can put a shared header/nav here */}
      <Outlet />
    </div>
  );
}

const App = () => (
  <div data-theme="nord">
    <Routes>
      {/* Institution (nested) */}
      <Route path="/:idOrName" element={<InstitutionLayout />}>
        {/* /:idOrName or /:idOrName/dashboard */}
        <Route index element={<I_Dashboard />} />
        <Route path="dashboard" element={<I_Dashboard />} />

        {/* /:idOrName/add_room */}
        <Route path="add_room" element={<AddRoom />} />
      </Route>

      {/* Teacher (flat) */}
      <Route
        path="/teacher/dashboard"
        element={<T_Dashboard />}
      />
      <Route
        path="/teacher/create/room"
        element={<T_CreateRoom />}
      />
      <Route
        path="/teacher/room/:id"
        element={<T_Room />}
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={<p>Page not found: {window.location.pathname}</p>}
      />
    </Routes>
  </div>
);

export default App;