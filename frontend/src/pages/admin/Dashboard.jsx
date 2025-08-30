import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Users, Calendar, Settings, Shield, Activity } from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/institutions");
      setInstitutions(response.data);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          Admin Dashboard
        </h1>
        <p className="text-base-content/70">
          Manage all institutions and system resources
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-blue-300 group p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-blue-600">
                Total Institutions
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-blue-700">
                {institutions.length}
              </p>
            </div>
            <Building className="h-12 w-12 text-blue-500 group-hover:text-blue-600" />
          </div>
        </div>

        <div className="card bg-base-100 hover:bg-green-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-green-300 group p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-green-600">
                Active Institutions
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-green-700">
                {institutions.filter(inst => inst.active).length}
              </p>
            </div>
            <Activity className="h-12 w-12 text-green-500 group-hover:text-green-600" />
          </div>
        </div>

        <div className="card bg-base-100 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-purple-300 group p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-purple-600">
                System Status
              </p>
              <p className="text-xl font-bold text-base-content group-hover:text-purple-700">
                Online
              </p>
            </div>
            <Shield className="h-12 w-12 text-purple-500 group-hover:text-purple-600" />
          </div>
        </div>
      </div>

      {/* All Institutions */}
      <div className="card bg-base-100 border border-base-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-base-content">
              All Institutions
            </h2>
          </div>
          <div className="text-sm text-base-content/70">
            Total: {institutions.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base-content/70">No institutions found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {institutions.map((institution) => (
              <div
                key={institution._id}
                className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="card-title text-lg font-semibold text-base-content">
                      {institution.name}
                    </h3>
                    <div className={`badge ${institution.active ? 'badge-success' : 'badge-error'} badge-sm`}>
                      {institution.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-base-content/80">EIIN:</span>
                      <span className="ml-2 text-base-content/70">{institution.eiin}</span>
                    </div>
                    <div>
                      <span className="font-medium text-base-content/80">Email:</span>
                      <span className="ml-2 text-base-content/70">{institution.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-base-content/80">Created:</span>
                      <span className="ml-2 text-base-content/70">
                        {new Date(institution.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
