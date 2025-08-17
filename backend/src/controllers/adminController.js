import jwt from "jsonwebtoken";

const ADMIN = {
  username: "admin",
  email:    "admin@example.com",
  password: "password123"
};

// In-memory list of pending institution requests
let pendingInstitutions = [
  { id: "1", name: "AlphaAcademy", eiin: "1001" },
  { id: "2", name: "BetaInstitute", eiin: "2002" }
];

// Helper to generate an 8-char passkey
function makePasskey(name) {
  const namePart = name.slice(0, 4);
  const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${namePart}_${randomNum}`;
}

// POST /api/admin/login
export function loginAdmin(req, res) {
  const { username, password } = req.body;
  if (
    username !== ADMIN.username ||
    password !== ADMIN.password
  ) {
    return res
      .status(401)
      .json({ message: "Invalid credentials" });
  }
  const token = jwt.sign(
    { username: ADMIN.username, email: ADMIN.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token, username: ADMIN.username });
}

// GET /api/admin/institutions/pending
export function getPendingInstitutions(req, res) {
  res.json(pendingInstitutions);
}

// POST /api/admin/institutions/:id/approve
export function approveInstitution(req, res) {
  const { id } = req.params;
  const instIndex = pendingInstitutions.findIndex(
    (i) => i.id === id
  );
  if (instIndex === -1) {
    return res.status(404).json({ message: "Not found" });
  }

  const inst = pendingInstitutions[instIndex];
  const passkey = makePasskey(inst.name);

  // Remove from pending
  pendingInstitutions.splice(instIndex, 1);

  res.json({ passkey, institution: inst });
}