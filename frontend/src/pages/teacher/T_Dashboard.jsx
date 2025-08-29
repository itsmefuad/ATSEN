import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import InstitutionAnnouncementsWidget from "../../components/common/InstitutionAnnouncementsWidget";
import ClassRoutine from "../../components/ClassRoutine";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import RoomCard from "../../components/RoomCard";
import { useAuth } from "../../contexts/AuthContext.jsx";
const T_Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user?._id) return;

      try {
        const res = await api.get(`/instructors/${user._id}/rooms`);
        console.log(res.data);
        setRooms(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching rooms");
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load rooms");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user]);

  // Show loading spinner if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-[95vw] mx-auto px-2 py-4 mt-6 flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-2 text-base-content/70">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-[95vw] mx-auto px-2 py-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Welcome, {user?.name || "Instructor"}
          </h1>
          <p className="text-base-content/70">
            Manage your courses and students
          </p>
        </div>

        {loading && (
          <div className="text-center text-primary py-10">
            Loading courses...
          </div>
        )}

        {!isRateLimited && (
          <>
            {rooms.length > 0 ? (
              <div className="space-y-8">
                {/* Grid with rooms and routine */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                  {/* Rooms Grid */}
                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {rooms.map((room) => (
                        <RoomCard key={room._id} room={room} />
                      ))}
                    </div>
                  </div>

                  {/* Class Routine */}
                  <div className="lg:col-span-3">
                    <ClassRoutine
                      rooms={rooms}
                      userType="instructor"
                      userId={user?._id}
                    />
                  </div>
                </div>

                {/* Institution Announcements Widget */}
                <InstitutionAnnouncementsWidget
                  userType="instructor"
                  userId={user?._id}
                />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Message when no rooms exist */}
                <div className="flex justify-center mt-20">
                  <div className="text-center p-12 w-80 h-64 bg-base-100 rounded-lg border border-base-300">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-base-content mb-2">
                      No Courses Yet
                    </h3>
                    <p className="text-base-content/70">
                      You haven't been assigned to any courses yet. Contact your
                      institution administrator to get added to courses.
                    </p>
                  </div>
                </div>

                {/* Show announcements even if no rooms */}
                <InstitutionAnnouncementsWidget
                  userType="instructor"
                  userId={user?._id}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default T_Dashboard;
