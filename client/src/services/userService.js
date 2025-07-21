// client/src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get all users
const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Register/Create a new user
const registerUser = async (userData, token) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
  // userData is expected to be FormData
  const response = await axios.post(API_URL + 'register', userData, config);
  return response.data;
};

// Delete a user
const deleteUser = async (userId, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.delete(API_URL + userId, config);
    return response.data;
  };

const userService = {
  getUsers,
  registerUser,
  deleteUser,
};

export default userService;
