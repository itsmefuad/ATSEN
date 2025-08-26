// frontend/src/pages/institution/InstructorList.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Users, Mail, Phone, Trash2, UserPlus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function InstructorList() {
  const { idOrName } = useParams();
  const [insts, setInsts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const handleRemoveInstructor = async (instructorId) => {
    if (!confirm("Are you sure you want to remove this instructor?")) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/remove-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instructorId }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setInsts((prev) => prev.filter((i) => i._id !== instructorId));
      toast.success("Instructor removed successfully");
    } catch (err) {
      console.error("Remove instructor failed:", err);
      setErrMsg("Could not remove instructor.");
      toast.error("Failed to remove instructor");
    }
  };

  useEffect(() => {
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setInsts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Failed to load instructors.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading instructors...
        </div>
      </div>
    );
  if (errMsg)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{errMsg}</div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to={`/${encodeURIComponent(idOrName)}`}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              Instructors
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your institution's instructors
            </p>
          </div>
        </div>

        <Link
          to={`/${encodeURIComponent(idOrName)}/add-instructor`}
          className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium group"
        >
          <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Add Instructor
        </Link>
      </div>

      {/* Instructors List */}
      {insts.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No instructors found
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding instructors to your institution.
          </p>
          <Link
            to={`/${encodeURIComponent(idOrName)}/add-instructor`}
            className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add First Instructor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insts.map((instructor) => (
            <div
              key={instructor._id}
              className="bg-white hover:shadow-lg transition-all duration-200 rounded-lg border border-gray-200 hover:border-purple-300 group p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 mb-2">
                    {instructor.name}
                  </h3>

                  {instructor.email && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{instructor.email}</span>
                    </div>
                  )}

                  {instructor.phone && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{instructor.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveInstructor(instructor._id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove instructor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Instructor</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
