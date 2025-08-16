// frontend/src/pages/institution/InstitutionRooms.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

export default function InstitutionRooms() {
  const { idOrName } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!idOrName) return;

    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/rooms`
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }
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

  if (loading) return <p>Loading rooms...</p>;
  if (errMsg) return <p>{errMsg}</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Rooms</h1>
      {rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rooms.map((room) => (
            <li
              key={room._id}
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
              }}
            >
              <strong>{room.room_name}</strong>
              {/* Optional: link into a room detail page */}
              <Link
                to={`room/${room._id}`}
                style={{ marginLeft: "1rem", fontSize: "0.9rem" }}
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}