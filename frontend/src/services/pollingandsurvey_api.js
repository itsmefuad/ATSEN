const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
function getInstitutionHeader() {
  try {
    const inst = localStorage.getItem('yuvraj_institution');
    if (inst) return { 'x-institution-id': inst };
  } catch (e) {}
  return {};
}

export async function listPollingAndSurveys(limit = 20) {
  const headers = getInstitutionHeader();
  const url = `${API}/api/PollingAndSurvey?limit=${limit}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error("Failed to list PollingAndSurvey items");
  const data = await r.json();
  return data.map((d) => ({ ...d, id: d.id || d._id }));
}

export async function getPollingAndSurveyById(id) {
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}`, { headers: getInstitutionHeader() });
  if (!r.ok) throw new Error("Failed to get item");
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function createPollingAndSurvey(body) {
  const r = await fetch(`${API}/api/PollingAndSurvey`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
  "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
  ...getInstitutionHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let message = `${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      message += `: ${j.message || JSON.stringify(j)}`;
    } catch (e) {
      try {
        const t = await r.text();
        if (t) message += `: ${t}`;
      } catch {}
    }
    throw new Error(`Failed to create item (${message})`);
  }
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function updatePollingAndSurvey(id, body) {
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
  "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
  ...getInstitutionHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let message = `${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      message += `: ${j.message || JSON.stringify(j)}`;
    } catch (e) {
      try {
        const t = await r.text();
        if (t) message += `: ${t}`;
      } catch {}
    }
    throw new Error(`Failed to update item (${message})`);
  }
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function deletePollingAndSurvey(id) {
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}`, {
    method: "DELETE",
    headers: { "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "", ...getInstitutionHeader() },
  });
  if (!r.ok) {
    let message = `${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      message += `: ${j.message || JSON.stringify(j)}`;
    } catch (e) {
      try {
        const t = await r.text();
        if (t) message += `: ${t}`;
      } catch {}
    }
    throw new Error(`Failed to delete item (${message})`);
  }
  return true;
}

export async function submitResponse(id, body) {
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getInstitutionHeader() },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let message = `${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      message += `: ${j.message || JSON.stringify(j)}`;
    } catch (e) {
      try {
        const t = await r.text();
        if (t) message += `: ${t}`;
      } catch {}
    }
    throw new Error(`Failed to submit response (${message})`);
  }
  return await r.json();
}

export async function listResponses(id) {
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}/responses`, {
    headers: { "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
  });
  if (!r.ok) throw new Error("Failed to list responses");
  return await r.json();
}

export async function getPollingSummary(id) {
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}/summary`, {
    headers: { "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" },
  });
  if (!r.ok) {
    let msg = `${r.status} ${r.statusText}`;
    try { const j = await r.json(); msg += `: ${j.message || JSON.stringify(j)}`; } catch(e) {}
    throw new Error(`Failed to fetch summary (${msg})`);
  }
  return await r.json();
}
