// frontend/src/pages/institution/InstructorList.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function InstructorList() {
  const { idOrName } = useParams();
  const [insts, setInsts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");

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

  if (loading) return <p>Loading instructors...</p>;
  if (errMsg)  return <p>{errMsg}</p>;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Instructors
      </h1>
      {insts.length === 0 ? (
        <p>No instructors found.</p>
      ) : (
        <ul>
          {insts.map((i) => (
            <li key={i._id}>{i.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}