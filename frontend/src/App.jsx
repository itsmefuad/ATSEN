import { Routes, Route } from "react-router"

import I_Dashboard from "./pages/institution/I_Dashboard.jsx";


import T_Dashboard from "./pages/teacher/T_Dashboard.jsx"
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx"
import T_Room from "./pages/teacher/T_Room.jsx"

const App = () => (
  <div data-theme="nord">
    <Routes>
      {/* Institution Dashboard */}
      <Route path="/dashboard/:idOrName" element={<I_Dashboard />} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<T_Dashboard />} />
      <Route path="/teacher/create/room" element={<T_CreateRoom />} />
      <Route path="/teacher/room/:id" element={<T_Room />} />

      {/* Catch-All */}
      <Route path="*" element={<p>Page not found: {window.location.pathname}</p>} />
    </Routes>
  </div>
)

export default App