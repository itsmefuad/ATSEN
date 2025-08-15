// frontend/src/pages/institution/AddRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function AddRoom() {
  const { idOrName } = useParams();
  const navigate     = useNavigate();

  // Form state
  const [roomName, setRoomName]           = useState("");
  const [description, setDescription]     = useState("");
  const [capacity, setCapacity]           = useState(30);
  const [searchQuery, setSearchQuery]     = useState("");
  const [instructors, setInstructors]     = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Fetch instructors for this institution
  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => res.json())
      .then((list) => setInstructors(list))
      .catch((err) => console.error("Fetch instructors:", err));
  }, [idOrName]);

  // Filter search results
  useEffect(() => {
    setFiltered(
      instructors.filter((tutor) =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, instructors]);

  // Capacity handlers
  const decrement = () => setCapacity((n) => Math.max(0, n - 1));
  const increment = () => setCapacity((n) => Math.min(10000, n + 1));

  // Submit handler
  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      name: roomName,
      description,
      capacity,
      instructors: selectedInstructor ? [selectedInstructor._id] : [],
      institution: idOrName,
    };

    try {
      const res = await fetch("http://localhost:5001/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create room");
      }
      // Redirect to nested dashboard
      navigate(`/${encodeURIComponent(idOrName)}/dashboard`);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Add New Room</h1>
      <form onSubmit={handleCreate}>
        {/* Room Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Room Name
            <br />
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Description
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>

        {/* Capacity Counter */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Capacity
            <br />
            <button type="button" onClick={decrement} style={{ marginRight: "0.5rem" }}>
              −
            </button>
            <span>{capacity}</span>
            <button type="button" onClick={increment} style={{ marginLeft: "0.5rem" }}>
              +
            </button>
          </label>
        </div>

        {/* Assign Instructor */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Assign Instructor
            <br />
            <input
              type="text"
              placeholder="Search by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>

          {searchQuery && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                marginTop: "0.5rem",
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ccc",
              }}
            >
              {filtered.map((tutor) => (
                <li
                  key={tutor._id}
                  onClick={() => {
                    setSelectedInstructor(tutor);
                    setSearchQuery("");
                  }}
                  style={{
                    padding: "0.5rem",
                    cursor: "pointer",
                    background:
                      selectedInstructor?._id === tutor._id ? "#def" : "#fff",
                  }}
                >
                  {tutor.name}
                </li>
              ))}
            </ul>
          )}

          {selectedInstructor && (
            <div style={{ marginTop: "0.5rem" }}>
              Assigned to: <strong>{selectedInstructor.name}</strong>{" "}
              <button type="button" onClick={() => setSelectedInstructor(null)}>
                ×
              </button>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create Room
          </button>

          {/* Cancel back to nested dashboard */}
          <Link
            to={`/${encodeURIComponent(idOrName)}/dashboard`}
            style={{ alignSelf: "center", color: "#555" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}