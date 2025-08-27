import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import InstitutionCard from "../../components/InstitutionCard";
import InstitutionAnnouncementsWidget from "../../components/common/InstitutionAnnouncementsWidget";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import {
  BookOpen,
  Users,
  Calendar,
  Building,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
const S_Dashboard = () => {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsByInstitution, setRoomsByInstitution] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rooms");

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) return;

      try {
        // Fetch rooms grouped by institution
        const roomsRes = await api.get(`/students/${user.id}/rooms`);
        setRoomsByInstitution(roomsRes.data);

        // Extract all rooms for backwards compatibility (if needed)
        const allRooms = [];
        Object.values(roomsRes.data).forEach((group) => {
          allRooms.push(...group.rooms);
        });
        setRooms(allRooms);

        // Fetch student details with institutions
        const studentRes = await api.get(`/students/${user.id}`);
        if (studentRes.data.institutions) {
          setInstitutions(studentRes.data.institutions);
        }

        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching student data");
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDocumentRequestSuccess = () => {
    toast.success("Document request submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Welcome, {user?.name || "Student"}
          </h1>
          <p className="text-base-content/70">
            Manage your rooms and request documents from your institutions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex bg-base-300 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === "rooms"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/70 hover:bg-base-100 hover:text-primary"
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              My Rooms
            </button>
            <button
              onClick={() => setActiveTab("institutions")}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === "institutions"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/70 hover:bg-base-100 hover:text-primary"
              }`}
            >
              <Building className="h-4 w-4 mr-2" />
              My Institutions
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === "documents"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/70 hover:bg-base-100 hover:text-primary"
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              My Documents
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === "support"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-sky-600"
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Support Tickets
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-sky-600 py-10">
            Loading your enrolled rooms...
          </div>
        )}

        {!isRateLimited && (
          <>
            {/* Rooms Tab */}
            {activeTab === "rooms" && (
              <>
                {Object.keys(roomsByInstitution).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(roomsByInstitution).map(
                      ([institutionId, data]) => (
                        <div key={institutionId} className="mb-8">
                          {/* Institution Header */}
                          <div className="mb-6 border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-4">
                              {data.institution.logo && (
                                <img
                                  src={data.institution.logo}
                                  alt={data.institution.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                />
                              )}
                              <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                  <Building className="h-6 w-6 text-sky-500" />
                                  {data.institution.name}
                                </h2>
                                <p className="text-gray-600">
                                  {data.rooms.length} room
                                  {data.rooms.length !== 1 ? "s" : ""} enrolled
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Rooms Grid for this Institution */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.rooms.map((room) => (
                              <Link
                                key={room._id}
                                to={`/student/room/${room._id}/forum`}
                                className="card bg-base-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-base-300 group border-t-4 border-solid border-t-[#00A2E8]"
                              >
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-base-content group-hover:text-primary">
                                      {room.room_name}
                                    </h3>
                                    <BookOpen className="h-5 w-5 text-primary group-hover:text-primary" />
                                  </div>
                                  <p className="text-base-content/70 line-clamp-3 mb-4">
                                    {room.description}
                                  </p>

                                  <div className="flex items-center justify-between text-sm text-base-content/60">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(room.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>Enrolled</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    {/* Institution Announcements Widget */}
                    <div className="mt-8">
                      <InstitutionAnnouncementsWidget
                        userType="student"
                        userId={user?.id}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center py-20">
                      <BookOpen className="w-20 h-20 text-base-content/40 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-base-content/70 mb-2">
                        No enrolled rooms yet
                      </h3>
                      <p className="text-base-content/60 mb-6">
                        You haven't been enrolled in any rooms yet. Contact your
                        instructor to get started.
                      </p>
                    </div>

                    {/* Show announcements even if no rooms */}
                    <InstitutionAnnouncementsWidget
                      userType="student"
                      userId={user?.id}
                    />
                  </div>
                )}
              </>
            )}

            {/* Institutions Tab */}
            {activeTab === "institutions" && (
              <>
                {institutions.length > 0 ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-base-content mb-2">
                        Your Institutions
                      </h2>
                      <p className="text-gray-600">
                        Request documents from any of your associated
                        institutions
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {institutions.map((institution) => (
                        <InstitutionCard
                          key={institution._id}
                          institution={institution}
                          onRequestSuccess={handleDocumentRequestSuccess}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Building className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      No institutions found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You are not associated with any institutions yet. Contact
                      your institution's admin to get enrolled.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-4">
                  View Your Document Requests
                </h3>
                <p className="text-gray-500 mb-6">
                  Track the status of your document requests and manage
                  completed documents.
                </p>
                <Link
                  to="/student/documents"
                  className="inline-flex items-center px-6 py-3 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors font-medium"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  View All Documents
                </Link>
              </div>
            )}

            {/* Support Tickets Tab */}
            {activeTab === "support" && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-4">
                  Your Support Tickets
                </h3>
                <p className="text-gray-500 mb-6">
                  View and manage your support requests to institutions. Track
                  responses and resolve issues.
                </p>
                <Link
                  to="/student/support-tickets"
                  className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  View Support Tickets
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default S_Dashboard;
