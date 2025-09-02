import api from "../lib/axios.js";

// Get consultation slots
export const getConsultationSlots = async () => {
  try {
    const response = await api.get("/helpdesk/consultation-slots");
    return response.data;
  } catch (error) {
    console.error("Error fetching consultation slots:", error);
    throw error;
  }
};

// Create consultation slot
export const createConsultationSlot = async (slotData) => {
  try {
    const response = await api.post("/helpdesk/consultation-slots", slotData);
    return response.data;
  } catch (error) {
    console.error("Error creating consultation slot:", error);
    throw error;
  }
};

// List help desk requests
export const listHelpDeskRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Backend handles role-based filtering automatically
    // Only pass additional filters if needed
    if (filters.studentId) {
      params.append("studentId", filters.studentId);
    }
    
    if (filters.assigneeId) {
      params.append("assigneeId", filters.assigneeId);
    }
    
    if (filters.assigneeType) {
      params.append("assigneeType", filters.assigneeType);
    }
    
    const response = await api.get(`/helpdesk/requests?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error listing help desk requests:", error);
    throw error;
  }
};

// Create help desk request
export const createHelpDeskRequest = async (requestData) => {
  try {
    const response = await api.post("/helpdesk/requests", requestData);
    return response.data;
  } catch (error) {
    console.error("Error creating help desk request:", error);
    throw error;
  }
};

// Update help desk request status
export const updateHelpDeskStatus = async (requestId, status, timelineEntry) => {
  try {
    const response = await api.put(`/helpdesk/requests/${requestId}/status`, {
      status,
      timelineEntry
    });
    return response.data;
  } catch (error) {
    console.error("Error updating help desk status:", error);
    throw error;
  }
};

// Get help desk request by ID
export const getHelpDeskRequest = async (requestId) => {
  try {
    const response = await api.get(`/helpdesk/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching help desk request:", error);
    throw error;
  }
};

// Delete help desk request
export const deleteHelpDeskRequest = async (requestId) => {
  try {
    const response = await api.delete(`/helpdesk/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting help desk request:", error);
    throw error;
  }
};
