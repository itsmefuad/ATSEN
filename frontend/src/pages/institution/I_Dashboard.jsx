// frontend/src/pages/institution/I_Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building,
  Users,
  BookOpen,
  UserPlus,
  GraduationCap,
  Plus,
  FileText,
  Settings,
} from "lucide-react";

export default function I_Dashboard() {
  const { idOrName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-primary py-10">
          Loading dashboard...
        </div>
      </div>
    );
  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-error py-10">{errMsg}</div>
      </div>
    );
  if (!data)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-base-content/60 py-10">
          No data available
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          {data.name} Dashboard
        </h1>
        <p className="text-base-content/70">
          Manage your institution's resources and data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/rooms`}
          className="card bg-base-100 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-blue-300 group p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-blue-600">
                Total Rooms
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-blue-700">
                {data.totalRooms ?? 0}
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-500 group-hover:text-blue-600" />
          </div>
        </Link>

        <Link
          to={`/${encodeURIComponent(idOrName)}/students`}
          className="card bg-base-100 hover:bg-green-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-green-300 group p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-green-600">
                Active Students
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-green-700">
                {data.activeStudents ?? 0}
              </p>
            </div>
            <GraduationCap className="h-12 w-12 text-green-500 group-hover:text-green-600" />
          </div>
        </Link>

        <Link
          to={`/${encodeURIComponent(idOrName)}/instructors`}
          className="card bg-base-100 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 border border-base-300 hover:border-purple-300 group p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/70 group-hover:text-purple-600">
                Total Instructors
              </p>
              <p className="text-3xl font-bold text-base-content group-hover:text-purple-700">
                {data.totalInstructors ?? 0}
              </p>
            </div>
            <Users className="h-12 w-12 text-purple-500 group-hover:text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 border border-base-300 p-6 mb-8">
        <h2 className="text-xl font-semibold text-base-content mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-room`}
            className="btn btn-primary flex items-center justify-center px-6 py-4 font-medium group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Room
          </Link>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-student`}
            className="btn btn-success flex items-center justify-center px-6 py-4 font-medium group"
          >
            <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Student
          </Link>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-instructor`}
            className="btn btn-secondary flex items-center justify-center px-6 py-4 font-medium group"
          >
            <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Instructor
          </Link>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Desk */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold text-base-content">
              Document Desk
            </h3>
          </div>
          <p className="text-base-content/70 mb-4">
            Manage document requests and institutional paperwork efficiently.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/document-desk`}
            className="btn btn-warning text-warning-content font-medium"
          >
            View Document Desk
          </Link>
        </div>

        {/* Institution Details */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-base-content/60 mr-3" />
              <h3 className="text-lg font-semibold text-base-content">
                Institution Details
              </h3>
            </div>
            <Link
              to={`/${encodeURIComponent(idOrName)}/settings`}
              className="p-2 text-base-content/40 hover:text-base-content/60 hover:bg-base-200 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.description && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Description
                </p>
                <p className="text-base-content">{data.description}</p>
              </div>
            )}
            {data.address && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Address
                </p>
                <p className="text-base-content">{data.address}</p>
              </div>
            )}
            {data.email && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Email
                </p>
                <p className="text-base-content">{data.email}</p>
              </div>
            )}
            {data.phone && (
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Phone
                </p>
                <p className="text-base-content">{data.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
