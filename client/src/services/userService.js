// client/src/services/userService.js
import axios from 'axios';

const API_URL = 'https://aspa-staff-production.up.railway.app/api/users/';

const getUsers = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const registerUser = async (userData, token) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL + 'register', userData, config);
  return response.data;
};

const deleteUser = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(API_URL + userId, config);
    return response.data;
};

const addUserBata = async (userId, bataData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + `${userId}/bata`, bataData, config);
    return response.data;
};

const raiseUserSalary = async (userId, salaryData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + `${userId}/salary`, salaryData, config);
    return response.data;
};

// Get all financial details for a single user
const getUserFinancialDetails = async (userId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + `${userId}/financials`, config);
    return response.data;
};

const userService = {
  getUsers,
  registerUser,
  deleteUser,
  addUserBata,
  raiseUserSalary,
  getUserFinancialDetails,
};

export default userService;
