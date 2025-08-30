// controllers/adminController.js

import jwt from "jsonwebtoken";
import InstitutionPass from "../models/passkeys/I_Pass.js";
import Admin from "../models/Admin.js";
import Institution from "../models/institution.js";

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
export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }
    
    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      token, 
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/admin/institutions/pending
export function getPendingInstitutions(req, res) {
  res.json(pendingInstitutions);
}

// POST /api/admin/institutions/:id/approve
export async function approveInstitution(req, res) {
  const { id } = req.params;
  const instIndex = pendingInstitutions.findIndex(i => i.id === id);

  if (instIndex === -1) {
    return res.status(404).json({ message: "Institution request not found" });
  }

  const inst = pendingInstitutions[instIndex];
  const passkey = makePasskey(inst.name);

  // Persist passkey & institution metadata to MongoDB
  try {
    await InstitutionPass.create({
      passkey,
      name: inst.name,
      eiin: inst.eiin
    });
  } catch (error) {
    console.error("Error saving passkey:", error);
    return res
      .status(500)
      .json({ message: "Could not save passkey", error: error.message });
  }

  // Remove from in-memory pending list
  pendingInstitutions.splice(instIndex, 1);

  res.json({ passkey, institution: inst });
}

// GET /api/admin/institutions - Get all institutions
export async function getAllInstitutions(req, res) {
  try {
    const institutions = await Institution.find({})
      .select('name eiin email active createdAt')
      .sort({ createdAt: -1 });
    
    res.json(institutions);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    res.status(500).json({ message: "Failed to fetch institutions" });
  }
}