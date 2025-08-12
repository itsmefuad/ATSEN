import { useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";

const T_Dashboard = () => {
  const [israteLimited, setIsRateLimited] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen">
      <Navbar />

      {israteLimited && <RateLimitedUi />}
    </div>
  );
};
export default T_Dashboard;
