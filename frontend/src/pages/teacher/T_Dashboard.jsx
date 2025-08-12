import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import axios from "axios";
import toast from "react-hot-toast";
import RoomCard from "../../components/RoomCard";

const T_Dashboard = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/rooms");
        console.log(res.data);
        setRooms(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching rooms");
        if (error.response.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load rooms");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="mx-w-7xl mx-auto p-4 mt-6">
        {loading && (
          <div className="text-center text-primary py-10">Loading rooms...</div>
        )}

        {rooms.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default T_Dashboard;
