import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/admin/institutions/pending")
      .then((res) => setRequests(res.data))
      .catch(() => {
        // If token expired or invalid
        localStorage.clear();
        navigate("/admin/login");
      });
  }, []);

  const approve = async (id) => {
    try {
      const { data } = await api.post(`/admin/institutions/${id}/approve`);
      alert(`✅ Approved ${data.institution.name}\nPasskey: ${data.passkey}`);
      setRequests((r) => r.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top Bar */}
      <header className="bg-base-100 py-4 px-6 shadow-sm border-b border-base-300">
        <h1 className="text-lg font-medium text-base-content">
          Admin: {username}
        </h1>
      </header>

      {/* Pending Requests */}
      <main className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-base-content">
          Pending Institution Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-base-content/70">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="card bg-base-100 border border-base-300 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-base-content">{req.name}</p>
                  <p className="text-sm text-base-content/70">
                    EIIN: {req.eiin}
                  </p>
                </div>
                <button
                  onClick={() => approve(req.id)}
                  className="btn btn-success text-white px-4 py-2"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
