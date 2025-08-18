// frontend/src/pages/institution/StudentList.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function StudentList() {
  const { idOrName } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errMsg, setErrMsg]     = useState("");

  useEffect(() => {
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/students`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Failed to load students.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading) return <p>Loading students...</p>;
  if (errMsg)  return <p>{errMsg}</p>;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Students
      </h1>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul>
          {students.map((s) => (
            <li key={s._id}>{s.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}