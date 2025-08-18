// frontend/src/pages/institution/InstitutionRooms.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function InstitutionRooms() {
  const { idOrName }         = useParams();
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");

  // constant light-orange for all bars
  const BAR_COLOR = "hsl(30, 100%, 85%)";

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/rooms`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => {
        setRooms(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading rooms:", err);
        setErrMsg("Failed to load rooms.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading) return <p>Loading rooms…</p>;
  if (errMsg)  return <p>{errMsg}</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Rooms</h1>

      {rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rooms.map((room) => {
            const studentCount    = Array.isArray(room.students)
              ? room.students.length
              : 0;
            const instructorCount = Array.isArray(room.instructors)
              ? room.instructors.length
              : 0;

            return (
              <li
                key={room._id}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  marginBottom:   "0.75rem",
                  padding:        "0.75rem 1rem",
                  borderRadius:   "0.5rem",
                  background:     BAR_COLOR,
                  color:          "#0b1220",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1.1rem" }}>
                    {room.room_name}
                  </strong>
                  <div
                    style={{
                      fontSize:  "0.9rem",
                      color:     "#333",
                      marginTop: "0.25rem",
                    }}
                  >
                    {studentCount} student
                    {studentCount !== 1 ? "s" : ""} &bull;{" "}
                    {instructorCount} instructor
                    {instructorCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <Link
                  to={`/${encodeURIComponent(idOrName)}/rooms/${room._id}`}
                  style={{
                    fontSize:       "0.9rem",
                    textDecoration: "none",
                    color:          "#0b1220",
                    fontWeight:     600,
                  }}
                >
                  View
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}