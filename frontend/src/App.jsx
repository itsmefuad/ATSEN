import { Route, Routes } from "react-router";

import T_Dashboard from "./pages/teacher/T_Dashboard.jsx";
import T_CreateRoom from "./pages/teacher/T_CreateRoom.jsx";
import T_Room from "./pages/teacher/T_Room.jsx";
import toast from "react-hot-toast";

const App = () => {
  return (
    <div data-theme="nord">
      {/* <button onClick={() => toast.success("congrats")}>click me</button> */}
      <Routes>
        <Route path="/teacher/dashboard" element={<T_Dashboard />} />
        <Route path="/teacher/create/room" element={<T_CreateRoom />} />
        <Route path="/teacher/room/:id" element={<T_Room />} />
      </Routes>
    </div>
  );
};
export default App;
