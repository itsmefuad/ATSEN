// frontend/src/pages/institution/AddRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Home } from "lucide-react";
import SectionManager from "../../components/SectionManager.jsx";

export default function AddRoom() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  // form state
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // sections state
  const [sections, setSections] = useState([
    {
      sectionNumber: 1,
      classTimings: [
        { day: "", startTime: "", endTime: "" },
        { day: "", startTime: "", endTime: "" },
      ],
    },
    {
      sectionNumber: 2,
      classTimings: [
        { day: "", startTime: "", endTime: "" },
        { day: "", startTime: "", endTime: "" },
      ],
    },
    {
      sectionNumber: 3,
      classTimings: [
        { day: "", startTime: "", endTime: "" },
        { day: "", startTime: "", endTime: "" },
      ],
    },
    {
      sectionNumber: 4,
      classTimings: [
        { day: "", startTime: "", endTime: "" },
        { day: "", startTime: "", endTime: "" },
      ],
    },
    {
      sectionNumber: 5,
      classTimings: [
        { day: "", startTime: "", endTime: "" },
        { day: "", startTime: "", endTime: "" },
      ],
    },
  ]);

  // load all instructors for this institution
  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => res.json())
      .then(setInstructors)
      .catch((err) => console.error("Fetch instructors:", err));
  }, [idOrName]);

  // live‐filter instructor list
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFiltered([]);
    setFiltered(instructors.filter((t) => t.name.toLowerCase().includes(q)));
  }, [searchQuery, instructors]);

  // capacity controls
  const decrement = () => setMaxCapacity((n) => Math.max(0, n - 1));
  const increment = () => setMaxCapacity((n) => Math.min(10000, n + 1));

  // validate sections before submission
  const validateSections = () => {
    for (let section of sections) {
      for (let timing of section.classTimings) {
        if (!timing.day || !timing.startTime || !timing.endTime) {
          return false;
        }
      }
    }
    return true;
  };

  // submit handler
  const handleCreate = async (e) => {
    e.preventDefault();

    // Validate sections
    if (!validateSections()) {
      alert(
        "Please fill in all class timings for all sections. Each section needs 2 class timings."
      );
      return;
    }

    const payload = {
      room_name: roomName,
      description,
      maxCapacity,
      instructors: selectedInstructor ? [selectedInstructor._id] : [],
      institution: idOrName,
      sections: sections,
    };

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create room");
      }
      // redirect back to your dashboard or rooms list
      navigate(`/${encodeURIComponent(idOrName)}/dashboard`);
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/${encodeURIComponent(idOrName)}/dashboard`}
          className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-500" />
            Add New Room
          </h1>
          <p className="text-base-content/70 mt-1">
            Create a new room with sections and class timings
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Room Information Card */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <h2 className="text-xl font-semibold text-base-content mb-4">
            Room Information
          </h2>

          {/* Room Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Room Name *</span>
            </label>
            <input
              type="text"
              placeholder="Enter room name..."
              className="input input-bordered"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Description *</span>
            </label>
            <textarea
              placeholder="Enter room description..."
              className="textarea textarea-bordered h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Maximum Capacity */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Maximum Capacity</span>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={decrement}
                className="btn btn-outline btn-sm btn-circle"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold bg-base-200 px-4 py-2 rounded-lg min-w-[60px] text-center">
                {maxCapacity}
              </span>
              <button
                type="button"
                onClick={increment}
                className="btn btn-outline btn-sm btn-circle"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Assign Instructor */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Assign Instructor</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type instructor's name..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedInstructor(null);
                }}
                autoComplete="off"
              />

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filtered.length > 0 ? (
                    filtered.map((tutor) => (
                      <div
                        key={tutor._id}
                        onClick={() => {
                          setSelectedInstructor(tutor);
                          setSearchQuery("");
                        }}
                        className={`p-4 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                          selectedInstructor?._id === tutor._id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-base-content">
                          {tutor.name}
                        </div>
                        <div className="text-sm text-base-content/70">
                          {tutor.email}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-base-content/60">
                      No instructors found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Instructor Display */}
            {selectedInstructor && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Selected Instructor
                    </h3>
                    <p className="text-blue-700">{selectedInstructor.name}</p>
                    <p className="text-sm text-blue-600">
                      {selectedInstructor.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedInstructor(null)}
                    className="btn btn-ghost btn-sm btn-circle text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Class Sections Configuration Card */}
        <div className="card bg-base-100 border border-base-300 p-6">
          <h2 className="text-xl font-semibold text-base-content mb-4">
            Class Sections
          </h2>
          <SectionManager sections={sections} onSectionsChange={setSections} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="btn btn-primary px-6 py-3 font-medium"
          >
            <Home className="h-5 w-5 mr-2" />
            Create Room
          </button>

          <Link
            to={`/${encodeURIComponent(idOrName)}/dashboard`}
            className="btn btn-outline px-6 py-3 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
