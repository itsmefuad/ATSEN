const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getInstitutionHeader() {
  try { const inst = localStorage.getItem('yuvraj_institution'); if (inst) return { 'x-institution-id': inst }; } catch(e) {}
  return {};
}

export async function yuvrajListAnnouncements(limit = 7) {
  const r = await fetch(`${API}/api/yuvraj/announcements?limit=${limit}`, { headers: getInstitutionHeader() });
  if (!r.ok) throw new Error("Failed to list announcements");
  const data = await r.json();
  return data.map((d) => ({ ...d, id: d.id || d._id }));
}

export async function yuvrajGetAnnouncementById(id) {
  const r = await fetch(`${API}/api/yuvraj/announcements/${id}`, { headers: getInstitutionHeader() });
  if (!r.ok) throw new Error("Failed to get announcement");
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function yuvrajCreateAnnouncement(body) {
  console.log("Creating announcement with body:", body);
  console.log("API URL:", `${API}/api/yuvraj/announcements`);
  console.log("Headers:", { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "", ...getInstitutionHeader() });
  
  const r = await fetch(`${API}/api/yuvraj/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "", ...getInstitutionHeader() },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let message = `${r.status} ${r.statusText}`;
    try { const j = await r.json(); message += `: ${j.message || JSON.stringify(j)}`; } catch(e) { try { const t = await r.text(); if (t) message += `: ${t}`; } catch(e){} }
    throw new Error(`Failed to create announcement (${message})`);
  }
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}

export async function yuvrajUpdateAnnouncement(id, body) {
  console.log("Updating announcement with ID:", id);
  console.log("Update body:", body);
  console.log("API URL:", `${API}/api/yuvraj/announcements/${id}`);
  console.log("Headers:", { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "", ...getInstitutionHeader() });
  
  const r = await fetch(`${API}/api/yuvraj/announcements/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "", ...getInstitutionHeader() },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let message = `${r.status} ${r.statusText}`;
    try { const j = await r.json(); message += `: ${j.message || JSON.stringify(j)}`; } catch(e) { try { const t = await r.text(); if (t) message += `: ${t}`; } catch(e){} }
    throw new Error(`Failed to update announcement (${message})`);
  }
  const d = await r.json();
  return { ...d, id: d.id || d._id };
}


