import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";  

export default function I_Dashboard() {
  const { idOrName } = useParams();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrMsg("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading) return <p>Loading...</p>;
  if (errMsg)   return <p>{errMsg}</p>;
  if (!data)    return <p>No data available</p>;

  const bubbleBase = {
    borderRadius: "1rem",
    padding: "1rem 2rem",
    minWidth: "160px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const addBtnStyle = {
    textDecoration: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "10px",
    fontWeight: 600,
    color: "#0b1220",
    background: "#e6f7ff",
    border: "1px solid #b3e1ff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  // Pencil SVG icon
  const pencilIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{ verticalAlign: "middle", marginRight: 6 }}>
      <path d="M14.85 2.85a2.12 2.12 0 0 1 3 3l-9.5 9.5-4 1 1-4 9.5-9.5Zm2.12-2.12a4.12 4.12 0 0 0-5.83 0l-9.5 9.5A2 2 0 0 0 1 11.34l-1 4A2 2 0 0 0 3.66 19l4-1a2 2 0 0 0 1.41-1.41l9.5-9.5a4.12 4.12 0 0 0 0-5.83Z" fill="#2563eb"/>
    </svg>
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Dashboard</h1>
      <div style={{
        display: "flex",
        gap: "2.5rem",
        marginTop: "2rem",
        alignItems: "flex-start",
        justifyContent: "center",
      }}>
        {/* Left Section: Buttons */}
        <div style={{ flex: 1, maxWidth: 480, display: "flex", flexDirection: "column", minWidth: 320 }}>
          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
            }}
          >
            <Link
              to={`/${encodeURIComponent(idOrName)}/rooms`}
              style={{ textDecoration: "none" }}
            >
              <div style={{ ...bubbleBase, background: "#e0f2fe" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {data.totalRooms ?? 0}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#333" }}>
                  Active Rooms
                </div>
              </div>
            </Link>

            <div style={{ ...bubbleBase, background: "#dcfce7" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {data.activeStudents ?? 0}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#333" }}>
                Active Students
              </div>
            </div>

            <div style={{ ...bubbleBase, background: "#fde68a" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {data.activeInstructors ?? 0}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#333" }}>
                Active Instructors
              </div>
            </div>
          </div>

          {/* Add Buttons */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
            }}
          >
            <Link
              to={`/${encodeURIComponent(idOrName)}/add-room`}
              style={addBtnStyle}
            >
              Add Room +
            </Link>
            <Link
              to={`/${encodeURIComponent(idOrName)}/add-student`}
              style={addBtnStyle}
            >
              Add Student +
            </Link>
            <Link
              to={`/${encodeURIComponent(idOrName)}/add-instructor`}
              style={addBtnStyle}
            >
              Add Instructor +
            </Link>
          </div>
        </div>

        {/* Right Section: Institution Details */}
        <div style={{
          flex: 1,
          background: "#f8fafc",
          borderRadius: "1rem",
          padding: "2rem",
          minWidth: 320,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "1.2rem", fontSize: "1.5rem" }}>
            {data.name}
          </h2>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>Description:</strong>
            <div style={{ marginLeft: 8, color: "#444" }}>{data.description || <span style={{ color: "#aaa" }}>No description</span>}</div>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>EIIN:</strong>
            <span style={{ marginLeft: 8 }}>{data.eiin || <span style={{ color: "#aaa" }}>N/A</span>}</span>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>Address:</strong>
            <span style={{ marginLeft: 8 }}>{data.address || <span style={{ color: "#aaa" }}>N/A</span>}</span>
          </div>
          <div style={{ flex: 1 }} /> {/* push button to bottom */}
          {/* Edit Institution Details Button */}
          <Link
            to={`/${encodeURIComponent(idOrName)}/settings`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.6rem 1.2rem",
              borderRadius: "10px",
              fontWeight: 600,
              color: "#fff",
              background: "#2563eb",
              border: "none",
              textDecoration: "none",
              marginTop: "auto"
            }}
          >
            {pencilIcon}
            Edit Institution Details
          </Link>
        </div>
      </div>
    </div>
  );
}