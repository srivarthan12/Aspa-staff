// client/src/services/paymentService.js
import axios from 'axios';

const API_URL = 'https://aspa-staff.onrender.com/api/payments/';

// Create a new payment record
const createPayment = async (paymentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, paymentData, config);
  return response.data;
};

// Get payment history for a specific employee
const getMyPayments = async (employeeId, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(API_URL + employeeId, config);
    return response.data;
  };
// Get all payments (for admin)
const getAllPayments = async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
  };

const paymentService = {
  createPayment,
  getMyPayments,
  getAllPayments,
};

export default paymentService;
