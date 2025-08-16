import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function InstitutionSettings() {
  const { idOrName } = useParams();
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });
  const [edit, setEdit] = useState({});
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!idOrName) return;
    fetch(`http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/dashboard`)
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => {
        setFields({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
        });
        setLoading(false);
      })
      .catch(err => {
        setErrMsg("Failed to load institution data.");
        setLoading(false);
      });
  }, [idOrName]);

  const handleEdit = key => setEdit(e => ({ ...e, [key]: true }));
  const handleChange = (key, value) => setFields(f => ({ ...f, [key]: value }));
  const handleSave = () => {
    setErrMsg(""); setSuccessMsg("");
    fetch(`http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        setSuccessMsg("Changes saved successfully.");
        setEdit({});
      })
      .catch(() => setErrMsg("Failed to save changes."));
  };

  if (loading) return <p>Loading...</p>;
  if (errMsg) return <p style={{ color: "red" }}>{errMsg}</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
      <h2>Institution Settings</h2>
      {["name", "email", "phone", "address", "description"].map(key => (
        <div key={key} style={{ marginBottom: "1.2rem" }}>
          <label style={{ fontWeight: 600, display: "block" }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}:
          </label>
          {edit[key] ? (
            key === "description" ? (
              <textarea
                value={fields[key]}
                onChange={e => handleChange(key, e.target.value)}
                rows={3}
                style={{ width: "100%" }}
              />
            ) : (
              <input
                type="text"
                value={fields[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{ width: "100%" }}
              />
            )
          ) : (
            <span>
              {fields[key] || <span style={{ color: "#aaa" }}>Not set</span>}
              <button
                style={{ marginLeft: 12 }}
                onClick={() => handleEdit(key)}
              >
                Edit
              </button>
            </span>
          )}
        </div>
      ))}
      <button
        style={{
          padding: "0.6rem 1.5rem",
          borderRadius: 8,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          fontWeight: 600,
          marginTop: 10,
        }}
        onClick={handleSave}
      >
        Save Changes
      </button>
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
    </div>
  );
}
