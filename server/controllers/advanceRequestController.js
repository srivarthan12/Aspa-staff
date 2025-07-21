// server/controllers/advanceRequestController.js
import AdvanceRequest from '../models/advanceRequestModel.js';
import User from '../models/userModel.js'; // Ensure this import exists

// @desc    Create a new advance request
// @route   POST /api/advances
// @access  Private/Staff
const createAdvanceRequest = async (req, res) => {
  const { amount } = req.body;
  const employeeId = req.user._id;

  const request = await AdvanceRequest.create({
    employee: employeeId,
    amount,
  });

  res.status(201).json(request);
};

// @desc    Get all advance requests
// @route   GET /api/advances
// @access  Private/Admin
const getAllAdvanceRequests = async (req, res) => {
    // FIX: Changed 'fullname' to 'username' to match your model
    const requests = await AdvanceRequest.find({}).populate('employee', 'username staffRole');
    res.json(requests);
};

// @desc    Update request status (approve/reject)
// @route   PUT /api/advances/:id
// @access  Private/Admin
const updateAdvanceRequestStatus = async (req, res) => {
    const { status } = req.body;

    const request = await AdvanceRequest.findById(req.params.id);

    if (request) {
        request.status = status;
        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
};

export { createAdvanceRequest, getAllAdvanceRequests, updateAdvanceRequestStatus };
