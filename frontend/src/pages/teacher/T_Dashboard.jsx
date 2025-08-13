import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import RoomCard from "../../components/RoomCard";
import { Link } from "react-router";
import { Plus } from "lucide-react";

const T_Dashboard = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms");
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

        {!isRateLimited && (
          <>
            {rooms.length > 0 ? (
              // Normal grid with rooms + create card
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room._id} room={room} setRooms={setRooms} />
                ))}
                <Link
                  to={"/teacher/create/room"}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-lg p-6 hover:bg-primary/5 transition"
                >
                  <Plus className="w-16 h-16 text-primary" />
                  <span className="mt-4 text-primary font-medium text-lg">
                    Create a Room
                  </span>
                </Link>
              </div>
            ) : (
              // Centered create card when no rooms exist
              <div className="flex justify-center mt-20">
                <Link
                  to={"/teacher/create/room"}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-lg p-12 hover:bg-primary/5 transition w-80 h-64"
                >
                  <Plus className="w-20 h-20 text-primary" />
                  <span className="mt-4 text-primary font-medium text-xl">
                    Create a Room
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default T_Dashboard;
