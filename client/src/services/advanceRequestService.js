// client/src/services/advanceRequestService.js
import axios from 'axios';

const API_URL = 'https://aspa-staff.onrender.com/api/advances/';

// Get all advance requests
const getAllRequests = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Update request status
const updateRequestStatus = async (requestId, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(API_URL + requestId, { status }, config);
  return response.data;
};

// Create a new advance request (This function was missing)
const createAdvanceRequest = async (requestData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, requestData, config);
    return response.data;
};


const advanceRequestService = {
  getAllRequests,
  updateRequestStatus,
  createAdvanceRequest, // Add the function to the export
};

export default advanceRequestService;
