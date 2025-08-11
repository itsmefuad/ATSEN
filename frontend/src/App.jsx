import { Route, Routes } from "react-router";

import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_Classroom from "./pages/teacher/T_Classroom.jsx";
import toast from "react-hot-toast";

const App = () => {
  return (
    <div data-theme="nord">
      <button className="btn btn-outline">click me</button>
      <Routes>
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/classroom/:id" element={<T_Classroom />} />
      </Routes>
    </div>
  );
};
export default App;
