import Material from "../models/Material.js";
import Room from "../models/Room.js";

// Get all materials for a room grouped by category
export async function getMaterialsByRoom(req, res) {
  try {
    const { roomId } = req.params;

    const materials = await Material.find({ room: roomId })
      .populate("instructor", "name email")
      .sort({ category: 1, createdAt: -1 });

    // Group materials by category
    const groupedMaterials = {
      course_materials: materials.filter(m => m.category === "course_materials"),
      reference_books: materials.filter(m => m.category === "reference_books"),
      articles_research_papers: materials.filter(m => m.category === "articles_research_papers")
    };

    res.status(200).json(groupedMaterials);
  } catch (error) {
    console.error("Error in getMaterialsByRoom controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Create new material
export async function createMaterial(req, res) {
  try {
    const { roomId } = req.params;
    const { title, description, type, category, author, fileUrl, fileName, fileSize } = req.body;
    const instructorId = req.user?.id; // Assuming auth middleware sets this

    // Verify room exists and instructor has access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const material = new Material({
      room: roomId,
      title,
      description,
      type,
      category,
      author,
      fileUrl,
      fileName,
      fileSize,
      instructor: instructorId
    });

    const savedMaterial = await material.save();
    const populatedMaterial = await Material.findById(savedMaterial._id)
      .populate("instructor", "name email");

    res.status(201).json(populatedMaterial);
  } catch (error) {
    console.error("Error in createMaterial controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update material
export async function updateMaterial(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, category, author, fileUrl, fileName, fileSize } = req.body;

    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { title, description, type, category, author, fileUrl, fileName, fileSize },
      { new: true }
    ).populate("instructor", "name email");

    if (!updatedMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json(updatedMaterial);
  } catch (error) {
    console.error("Error in updateMaterial controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete material
export async function deleteMaterial(req, res) {
  try {
    const { id } = req.params;

    const deletedMaterial = await Material.findByIdAndDelete(id);

    if (!deletedMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMaterial controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get single material by ID
export async function getMaterialById(req, res) {
  try {
    const { id } = req.params;

    const material = await Material.findById(id)
      .populate("instructor", "name email")
      .populate("room", "course_name section");

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json(material);
  } catch (error) {
    console.error("Error in getMaterialById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}