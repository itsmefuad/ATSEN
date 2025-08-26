// frontend/src/pages/institution/InstitutionRooms.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function InstitutionRooms() {
  const { idOrName }         = useParams();
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { roomId, roomName }
  const [deleting, setDeleting] = useState(false);
  const BAR_COLOR = "hsla(193, 47%, 76%, 1.00)";

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
        console.log("=== ROOMS DATA ===");
        console.log("Rooms received:", json);
        json.forEach((room, index) => {
          console.log(`Room ${index}:`, {
            id: room._id,
            name: room.room_name,
            idLength: room._id?.length
          });
        });
        setRooms(json);
        setLoading(false);
      })
      .catch(async (err) => {
        // try to pull the real error text
        let msg = err.message;
        if (err.response) {
          msg = await err.response.text();
        }
        console.error("Error loading rooms:", msg);
        setErrMsg(msg);
        setLoading(false);
      });


  }, [idOrName]);

  const handleDeleteClick = (roomId, roomName) => {
    setDeleteConfirm({ roomId, roomName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    setDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/rooms/${deleteConfirm.roomId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Remove the deleted room from the rooms state
      setRooms(prevRooms => prevRooms.filter(room => room._id !== deleteConfirm.roomId));
      
      // Close confirmation dialog
      setDeleteConfirm(null);
      
    } catch (error) {
      console.error("Error deleting room:", error);
      setErrMsg(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

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

            const formattedTime = room.createdAt
              ? new Date(room.createdAt).toLocaleString()
              : "N/A";

            return (
              <li
                key={room._id}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  padding:        "0.75rem 1rem",
                  marginBottom:   "0.75rem",
                  borderRadius:   "0.5rem",
                  background:     BAR_COLOR,
                  color:          "#0b1220",
                }}
              >
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
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
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link
                      to={`/${encodeURIComponent(idOrName)}/rooms/${room._id}/edit`}
                      style={{
                        fontSize:       "0.9rem",
                        textDecoration: "none",
                        color:          "#fff",
                        fontWeight:     600,
                        padding:        "0.4rem 0.8rem",
                        background:     "#10b981",
                        border:         "1px solid #10b981",
                        borderRadius:   "4px",
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(room._id, room.room_name)}
                      style={{
                        fontSize:       "0.9rem",
                        color:          "#fff",
                        fontWeight:     600,
                        padding:        "0.4rem 0.8rem",
                        background:     "#ef4444",
                        border:         "1px solid #ef4444",
                        borderRadius:   "4px",
                        cursor:         "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* createdTime display */}
                <div
                  style={{
                    fontSize:  "0.8rem",
                    color:     "#555",
                    marginTop: "0.5rem",
                  }}
                >
                  Created: {formattedTime}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "0.5rem",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 style={{ marginBottom: "1rem", color: "#ef4444" }}>
              Confirm Delete
            </h2>
            <p style={{ marginBottom: "1.5rem", color: "#374151" }}>
              Are you sure you want to delete the room "{deleteConfirm.roomName}"? 
              This action will remove the room from all students and instructors, 
              and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "1px solid #ef4444",
                  borderRadius: "0.25rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}