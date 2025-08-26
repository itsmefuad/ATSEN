// backend/src/controllers/institution/utils.js

import mongoose from "mongoose";
import Institution from "../../models/institution.js";

// Helper to find institution by _id, loginId, or slug
export const findInstitutionByIdOrName = async (idOrName) => {
  try {
    if (mongoose.isValidObjectId(idOrName)) {
      const byId = await Institution.findById(idOrName).lean();
      if (byId) {
        return byId;
      }
    }

    const bySlug = await Institution
      .findOne({ slug: new RegExp(`^${idOrName}$`, "i") })
      .lean();
    if (bySlug) {
      return bySlug;
    }

    const byName = await Institution
      .findOne({ name: new RegExp(`^${idOrName}$`, "i") })
      .lean();
    if (byName) {
      return byName;
    }
    
    return null;
  } catch (err) {
    console.error("Error in findInstitutionByIdOrName:", err);
    throw err;
  }
};