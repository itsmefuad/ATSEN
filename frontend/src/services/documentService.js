import api from "../lib/axios";

// Student Document Services
export const createDocumentRequest = async (requestData) => {
  try {
    const response = await api.post("/documents/request", requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getStudentDocuments = async () => {
  try {
    const response = await api.get("/documents/student/my-documents");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateStudentDocumentStatus = async (documentId) => {
  try {
    const response = await api.put(`/documents/student/${documentId}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Institution Document Services
export const getInstitutionDocuments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/documents/institution/documents${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateInstitutionDocumentStatus = async (documentId, updateData) => {
  try {
    const response = await api.put(`/documents/institution/${documentId}/status`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDocumentStatistics = async () => {
  try {
    const response = await api.get("/documents/institution/statistics");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Shared Services
export const getDocumentDetails = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
