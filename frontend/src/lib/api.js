import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

// Configure axios with default settings
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Room APIs
export const roomAPI = {
  getRoom: (roomId) => api.get(`/rooms/${roomId}`),
  getAllRooms: () => api.get("/rooms"),
  createRoom: (roomData) => api.post("/rooms", roomData),
  updateRoom: (roomId, roomData) => api.put(`/rooms/${roomId}`, roomData),
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`),
};

// Announcement APIs
export const announcementAPI = {
  getAnnouncementsByRoom: (roomId) => api.get(`/announcements/room/${roomId}`),
  createAnnouncement: (roomId, announcementData) => 
    api.post(`/announcements/room/${roomId}`, announcementData),
  updateAnnouncement: (announcementId, announcementData) => 
    api.put(`/announcements/${announcementId}`, announcementData),
  deleteAnnouncement: (announcementId) => 
    api.delete(`/announcements/${announcementId}`),
  addComment: (announcementId, commentData) => 
    api.post(`/announcements/${announcementId}/comments`, commentData),
  deleteComment: (announcementId, commentId) => 
    api.delete(`/announcements/${announcementId}/comments/${commentId}`),
};

// Material APIs
export const materialAPI = {
  getMaterialsByRoom: (roomId) => api.get(`/materials/room/${roomId}`),
  createMaterial: (roomId, materialData) => 
    api.post(`/materials/room/${roomId}`, materialData),
  getMaterial: (materialId) => api.get(`/materials/${materialId}`),
  updateMaterial: (materialId, materialData) => 
    api.put(`/materials/${materialId}`, materialData),
  deleteMaterial: (materialId) => api.delete(`/materials/${materialId}`),
};

// Assessment APIs
export const assessmentAPI = {
  getAssessmentsByRoom: (roomId) => api.get(`/assessments/room/${roomId}`),
  createAssessment: (roomId, assessmentData) => 
    api.post(`/assessments/room/${roomId}`, assessmentData),
  getAssessment: (assessmentId) => api.get(`/assessments/${assessmentId}`),
  updateAssessment: (assessmentId, assessmentData) => 
    api.put(`/assessments/${assessmentId}`, assessmentData),
  deleteAssessment: (assessmentId) => api.delete(`/assessments/${assessmentId}`),
  togglePublish: (assessmentId) => api.patch(`/assessments/${assessmentId}/publish`),
};

// Grade APIs
export const gradeAPI = {
  getGradesByRoom: (roomId) => api.get(`/grades/room/${roomId}`),
  getGradeStatistics: (roomId) => api.get(`/grades/room/${roomId}/statistics`),
  getStudentGrades: (studentId, roomId) => 
    api.get(`/grades/student/${studentId}/room/${roomId}`),
  upsertGrade: (studentId, assessmentId, gradeData) => 
    api.put(`/grades/student/${studentId}/assessment/${assessmentId}`, gradeData),
  deleteGrade: (gradeId) => api.delete(`/grades/${gradeId}`),
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error("API Error:", error);
  
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || "An error occurred";
    throw new Error(message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error("Unable to connect to server. Please check your connection.");
  } else {
    // Something else happened
    throw new Error("An unexpected error occurred");
  }
};

export default api;