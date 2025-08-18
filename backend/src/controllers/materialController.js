import Material from "../models/Material.js";
import Room from "../models/Room.js";

// Get all materials for a room
export const getMaterialsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const materials = await Material.find({ room: roomId })
      .sort({ section: 1, createdAt: -1 });

    console.log(`Found ${materials.length} materials for room ${roomId}`);
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Create a new material
export const createMaterial = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, description, section, fileType, fileUrl, fileName } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Create material
    const material = new Material({
      title: title.trim(),
      description: description.trim(),
      section,
      fileType,
      fileUrl: fileUrl || "",
      fileName,
      room: roomId
    });

    const savedMaterial = await material.save();
    console.log("Created material:", savedMaterial);
    res.status(201).json(savedMaterial);
  } catch (error) {
    console.error("Error creating material:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Update a material
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, section, fileType, fileUrl, fileName, isExpanded } = req.body;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Validate required fields if provided
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (description !== undefined && (!description || !description.trim())) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Update fields
    if (title) material.title = title.trim();
    if (description !== undefined) material.description = description.trim();
    if (section) material.section = section;
    if (fileType) material.fileType = fileType;
    if (fileUrl !== undefined) material.fileUrl = fileUrl || "";
    if (fileName) material.fileName = fileName;
    if (typeof isExpanded === 'boolean') material.isExpanded = isExpanded;

    const updatedMaterial = await material.save();
    res.status(200).json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      materialId: id,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Delete a material
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    await Material.findByIdAndDelete(id);
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle material expansion
export const toggleMaterialExpansion = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    material.isExpanded = !material.isExpanded;
    const updatedMaterial = await material.save();

    res.status(200).json(updatedMaterial);
  } catch (error) {
    console.error("Error toggling material expansion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
