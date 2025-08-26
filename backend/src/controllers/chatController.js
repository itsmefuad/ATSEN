import ChatMessage from "../models/ChatMessage.js";
import Student from "../models/student.js";
import Room from "../models/Room.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads in chat
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/chat';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadChatFile = upload.single('file');

// Get current student from token
const getCurrentStudent = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) {
    throw new Error('Invalid token');
  }
  
  const student = await Student.findById(decoded.id);
  if (!student) {
    throw new Error('Student not found');
  }
  
  return student;
};

// Get all messages for a room
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify student has access to this room
    const student = await getCurrentStudent(req);
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // Check if student is enrolled in the room
    if (!room.students.includes(student._id)) {
      return res.status(403).json({ message: "Access denied to this room" });
    }
    
    const skip = (page - 1) * limit;
    
    const messages = await ChatMessage.find({ 
      room: roomId, 
      isDeleted: false 
    })
      .populate('sender', 'name email')
      .populate('replyTo', 'content sender messageType')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Reverse to get chronological order
    messages.reverse();
    
    const totalMessages = await ChatMessage.countDocuments({ 
      room: roomId, 
      isDeleted: false 
    });
    
    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a text message
export const sendTextMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, replyTo } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    const student = await getCurrentStudent(req);
    
    // Verify room access
    const room = await Room.findById(roomId);
    if (!room || !room.students.includes(student._id)) {
      return res.status(403).json({ message: "Access denied to this room" });
    }
    
    const message = new ChatMessage({
      room: roomId,
      sender: student._id,
      messageType: 'text',
      content: content.trim(),
      replyTo: replyTo || null
    });
    
    const savedMessage = await message.save();
    
    // Populate sender and replyTo information
    const populatedMessage = await ChatMessage.findById(savedMessage._id)
      .populate('sender', 'name email')
      .populate('replyTo', 'content sender messageType')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name'
        }
      });
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a file message
export const sendFileMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { replyTo } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    
    const student = await getCurrentStudent(req);
    
    // Verify room access
    const room = await Room.findById(roomId);
    if (!room || !room.students.includes(student._id)) {
      return res.status(403).json({ message: "Access denied to this room" });
    }
    
    const messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    
    const message = new ChatMessage({
      room: roomId,
      sender: student._id,
      messageType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      replyTo: replyTo || null
    });
    
    const savedMessage = await message.save();
    
    // Populate sender and replyTo information
    const populatedMessage = await ChatMessage.findById(savedMessage._id)
      .populate('sender', 'name email')
      .populate('replyTo', 'content sender messageType')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name'
        }
      });
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending file message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    const student = await getCurrentStudent(req);
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only sender can edit their message
    if (message.sender.toString() !== student._id.toString()) {
      return res.status(403).json({ message: "Can only edit your own messages" });
    }
    
    // Only text messages can be edited
    if (message.messageType !== 'text') {
      return res.status(400).json({ message: "Only text messages can be edited" });
    }
    
    // Can only edit within 24 hours
    const hoursSinceCreation = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({ message: "Messages can only be edited within 24 hours" });
    }
    
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    
    const updatedMessage = await message.save();
    
    const populatedMessage = await ChatMessage.findById(updatedMessage._id)
      .populate('sender', 'name email')
      .populate('replyTo', 'content sender messageType')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name'
        }
      });
    
    res.json(populatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const student = await getCurrentStudent(req);
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only sender can delete their message
    if (message.sender.toString() !== student._id.toString()) {
      return res.status(403).json({ message: "Can only delete your own messages" });
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
    
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }
    
    const student = await getCurrentStudent(req);
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if student already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.student.toString() === student._id.toString() && r.emoji === emoji
    );
    
    if (existingReaction) {
      // Remove existing reaction
      message.reactions = message.reactions.filter(
        r => !(r.student.toString() === student._id.toString() && r.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        student: student._id,
        emoji
      });
    }
    
    await message.save();
    
    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('sender', 'name email')
      .populate('reactions.student', 'name');
    
    res.json(populatedMessage);
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Download chat file
export const downloadChatFile = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const student = await getCurrentStudent(req);
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Verify student has access to the room
    const room = await Room.findById(message.room);
    if (!room || !room.students.includes(student._id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (!message.filePath || !fs.existsSync(message.filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.download(message.filePath, message.fileName);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query, page = 1, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const student = await getCurrentStudent(req);
    
    // Verify room access
    const room = await Room.findById(roomId);
    if (!room || !room.students.includes(student._id)) {
      return res.status(403).json({ message: "Access denied to this room" });
    }
    
    const skip = (page - 1) * limit;
    
    const messages = await ChatMessage.find({
      room: roomId,
      isDeleted: false,
      $or: [
        { content: { $regex: query.trim(), $options: 'i' } },
        { fileName: { $regex: query.trim(), $options: 'i' } }
      ]
    })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalResults = await ChatMessage.countDocuments({
      room: roomId,
      isDeleted: false,
      $or: [
        { content: { $regex: query.trim(), $options: 'i' } },
        { fileName: { $regex: query.trim(), $options: 'i' } }
      ]
    });
    
    res.json({
      messages,
      query: query.trim(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasMore: skip + messages.length < totalResults
      }
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
