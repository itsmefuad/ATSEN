// frontend/src/pages/institution/EditRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Search,
  User,
  Mail,
} from "lucide-react";

export default function EditRoom() {
  const { idOrName, roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [instructorResults, setInstructorResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Room editing states
  const [editedRoomName, setEditedRoomName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  useEffect(() => {
    if (!idOrName || !roomId) return;

    const url = `http://localhost:5001/api/institutions/${encodeURIComponent(
      idOrName
    )}/rooms/${roomId}`;
    console.log("=== FRONTEND ROOM FETCH ===");
    console.log("Fetching URL:", url);
    console.log("idOrName:", idOrName);
    console.log("roomId:", roomId);

    fetch(url)
      .then((res) => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          return res.text().then((text) => {
            console.log("Error response:", text);
            throw new Error(`Status ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then((json) => {
        console.log("Room data received:", json);
        setRoom(json);
        setEditedRoomName(json.room_name || "");
        setEditedDescription(json.description || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch room failed:", err);
        setError("Could not load room details.");
        setLoading(false);
      });
  }, [idOrName, roomId]);

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student from the room?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/remove-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setRoom((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
      }));
    } catch (err) {
      console.error("Remove student failed:", err);
      setError("Could not remove student from room.");
    }
  };

  const handleRemoveInstructor = async (instructorId) => {
    if (
      !confirm("Are you sure you want to remove this instructor from the room?")
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/remove-instructor`,
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

      setRoom((prev) => ({
        ...prev,
        instructors: prev.instructors.filter((i) => i._id !== instructorId),
      }));
    } catch (err) {
      console.error("Remove instructor failed:", err);
      setError("Could not remove instructor from room.");
    }
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setStudentResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/students?search=${encodeURIComponent(query)}`
      );
      const students = await res.json();
      const filtered = students
        .filter((s) => s.email.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setStudentResults(filtered);
    } catch (err) {
      console.error("Search students failed:", err);
    }
  };

  const searchInstructors = async (query) => {
    if (!query.trim()) {
      setInstructorResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/instructors?search=${encodeURIComponent(query)}`
      );
      const instructors = await res.json();
      const filtered = instructors
        .filter((i) => i.email.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setInstructorResults(filtered);
    } catch (err) {
      console.error("Search instructors failed:", err);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/add-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedStudent.email }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setSelectedStudent(null);
      setStudentEmail("");
      setStudentResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Add student failed:", err);
      setError("Could not add student to room.");
    }
  };

  const handleAddInstructor = async () => {
    if (!selectedInstructor) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}/add-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedInstructor.email }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      setSelectedInstructor(null);
      setInstructorEmail("");
      setInstructorResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Add instructor failed:", err);
      setError("Could not add instructor to room.");
    }
  };

  // Room editing functions
  const handleSaveRoomInfo = async () => {
    if (!editedRoomName.trim() || !editedDescription.trim()) {
      alert("Room name and description are required");
      return;
    }

    setSavingRoom(true);
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms/${roomId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_name: editedRoomName,
            description: editedDescription,
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      const updatedRoom = await res.json();
      setRoom(updatedRoom);
      setIsEditingRoom(false);
      alert("Room information updated successfully!");
    } catch (err) {
      console.error("Update room failed:", err);
      alert("Could not update room information.");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedRoomName(room.room_name || "");
    setEditedDescription(room.description || "");
    setIsEditingRoom(false);
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-sky-600 py-10">
          Loading room details...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-red-600 py-10">{error}</div>
      </div>
    );
  if (!room)
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="text-center text-base-content/70 py-10">
          Room not found
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/rooms`}
          className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Edit Room: {room.room_name}
          </h1>
          <p className="text-base-content/70 mt-1">
            Manage room information, students and instructors
          </p>
        </div>
      </div>

      {/* Room Information Section */}
      <div className="card bg-base-100 border border-base-300 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-base-content flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Room Information
          </h2>
          {!isEditingRoom && (
            <button
              onClick={() => setIsEditingRoom(true)}
              className="btn btn-primary btn-sm"
            >
              Edit Info
            </button>
          )}
        </div>

        {isEditingRoom ? (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Room Name</span>
              </label>
              <input
                type="text"
                value={editedRoomName}
                onChange={(e) => setEditedRoomName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter room name"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="textarea textarea-bordered w-full h-24"
                placeholder="Enter room description"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="btn btn-ghost"
                disabled={savingRoom}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoomInfo}
                className="btn btn-primary"
                disabled={savingRoom}
              >
                {savingRoom ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-medium">Room Name</span>
              </label>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-base-content">{room.room_name}</p>
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Created Date</span>
              </label>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-base-content">
                  {new Date(room.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-base-content whitespace-pre-wrap">
                  {room.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Section */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-base-content">
              Students ({room.students?.length || 0})
            </h2>
          </div>
          {/* Add Student */}
          <div className="card bg-base-200 p-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search student by email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-base-content/40" />
                </div>
                <input
                  type="email"
                  placeholder="Search student by email"
                  value={studentEmail}
                  onChange={(e) => {
                    setStudentEmail(e.target.value);
                    searchStudents(e.target.value);
                    setSelectedStudent(null);
                  }}
                  className="input input-bordered w-full pl-10 bg-base-100"
                />

                {/* Search Results */}
                {studentResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {studentResults.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setStudentEmail(student.email);
                          setStudentResults([]);
                        }}
                        className={`p-3 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedStudent?._id === student._id
                            ? "bg-green-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {student.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {student.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleAddStudent}
              disabled={!selectedStudent}
              className="btn btn-success mt-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Room
            </button>

            {/* Selected Student */}
            {selectedStudent && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-800">
                  Selected: <strong>{selectedStudent.name}</strong> (
                  {selectedStudent.email})
                </span>
              </div>
            )}
          </div>{" "}
          {room.students?.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
              <p className="text-base-content/60">
                No students assigned to this room.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {room.students.map((student) => (
                <div
                  key={student._id}
                  className="card bg-base-100 border border-base-300 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span className="text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Mail className="h-3 w-3" />
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructors Section */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-base-content">
              Instructors ({room.instructors?.length || 0})
            </h2>
          </div>
          {/* Add Instructor */}
          <div className="card bg-base-200 p-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search instructor by email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-base-content/40" />
                </div>
                <input
                  type="email"
                  placeholder="Search instructor by email"
                  value={instructorEmail}
                  onChange={(e) => {
                    setInstructorEmail(e.target.value);
                    searchInstructors(e.target.value);
                    setSelectedInstructor(null);
                  }}
                  className="input input-bordered w-full pl-10 bg-base-100"
                />

                {/* Search Results */}
                {instructorResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {instructorResults.map((instructor) => (
                      <div
                        key={instructor._id}
                        onClick={() => {
                          setSelectedInstructor(instructor);
                          setInstructorEmail(instructor.email);
                          setInstructorResults([]);
                        }}
                        className={`p-3 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedInstructor?._id === instructor._id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {instructor.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {instructor.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleAddInstructor}
              disabled={!selectedInstructor}
              className="btn btn-success mt-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Room
            </button>

            {/* Selected Instructor */}
            {selectedInstructor && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-blue-800">
                  Selected: <strong>{selectedInstructor.name}</strong> (
                  {selectedInstructor.email})
                </span>
              </div>
            )}
          </div>{" "}
          {room.instructors?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
              <p className="text-base-content/60">
                No instructors assigned to this room.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {room.instructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="card bg-base-100 border border-base-300 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-secondary text-secondary-content rounded-full w-10">
                          <span className="text-sm">
                            {instructor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content">
                          {instructor.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Mail className="h-3 w-3" />
                          <span>{instructor.email}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveInstructor(instructor._id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </button>
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
