import multer from "multer";
import fs from "fs";
import path from "path";

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/announcements';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadImage = upload.single('image');

// Upload image controller
export const uploadImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Create a URL that can be accessed from the frontend
    const imageUrl = `/api/uploads/announcements/${req.file.filename}`;
    
    res.status(200).json({
      message: "Image uploaded successfully",
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      message: "Failed to upload image",
      error: error.message
    });
  }
};

// Serve uploaded images
export const serveImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(process.cwd(), 'uploads', 'announcements', filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).json({ message: "Failed to serve image" });
  }
};
