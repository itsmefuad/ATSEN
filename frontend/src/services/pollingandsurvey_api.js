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
  // ensure body contains institution so backend can scope the item
  const inst = (() => { try { return localStorage.getItem('yuvraj_institution'); } catch(e) { return null; } })();
  if (!body.institution) body.institution = inst || 'Brac University';

  const headers = {
    "Content-Type": "application/json",
    "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
    ...getInstitutionHeader(),
  };
  console.debug("createPollingAndSurvey ->", { url: `${API}/api/PollingAndSurvey`, headers, body });
  const r = await fetch(`${API}/api/PollingAndSurvey`, {
    method: "POST",
    headers,
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
  // ensure body contains institution so backend can enforce scoping when header absent
  const inst = (() => { try { return localStorage.getItem('yuvraj_institution'); } catch(e) { return null; } })();
  if (!body.institution) body.institution = inst || 'Brac University';

  const headers = {
    "Content-Type": "application/json",
    "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "",
    ...getInstitutionHeader(),
  };
  console.debug("updatePollingAndSurvey ->", { url: `${API}/api/PollingAndSurvey/${id}`, headers, body });
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}`, {
    method: "PUT",
    headers,
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

export async function submitResponse(id, body) {
  const headers = { "Content-Type": "application/json", ...getInstitutionHeader() };
  console.debug("submitResponse ->", { url: `${API}/api/PollingAndSurvey/${id}/responses`, headers, body });
  const r = await fetch(`${API}/api/PollingAndSurvey/${id}/responses`, {
    method: "POST",
    headers,
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
