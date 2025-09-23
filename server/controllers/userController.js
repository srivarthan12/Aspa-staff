// server/controllers/userController.js
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose'; 
import Payment from '../models/paymentModel.js';
import AdvanceRequest from '../models/advanceRequestModel.js';

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { username, password, role } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    // Check if the role matches
    if ((role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) || (role === 'staff' && user.role === 'staff')) {
        
        // --- THIS IS THE FIX ---
        // Create the base response object
        const responsePayload = {
            _id: user._id,
            username: user.username,
            role: user.role,
            photo: user.photo,
            token: generateToken(user._id),
        };

        // If the user is staff, add staff-specific fields
        if (user.role === 'staff') {
            responsePayload.staffRole = user.staffRole;
            responsePayload.salary = user.salary;
            responsePayload.bata = user.bata;
        }

        res.json(responsePayload);

    } else {
        res.status(401);
        throw new Error('Invalid role for this login page');
    }
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
};


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Private/Admin
const registerUser = async (req, res) => {
    const {username, password, role, staffRole, salary } = req.body;
    
    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    let photoUrl = '';
    if (req.file) {
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            photoUrl = result.secure_url;
        } catch (error) {
            console.error('Cloudinary Upload Error:', error); 
            res.status(500);
            throw new Error('Image could not be uploaded');
        }
    }

    const user = await User.create({
        
        username,
        password,
        role,
        staffRole: role === 'staff' ? staffRole : undefined,
        salary: role === 'staff' ? salary : undefined,
        photo: photoUrl,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            photo: user.photo,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'superadmin') {
            res.status(400);
            throw new Error('Cannot delete Super Admin user');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};
// @desc    Add bata for a staff member
// @route   POST /api/users/:id/bata
// @access  Private/Admin
const addUserBata = async (req, res) => {
    const { amount, description } = req.body;
    const user = await User.findById(req.params.id);

    if (user && user.role === 'staff') {
        user.bata.push({ amount, description });
        const updatedUser = await user.save();
        res.status(201).json(updatedUser.bata);
    } else {
        res.status(404);
        throw new Error('Staff member not found');
    }
};

// @desc    Update a user's salary
// @route   PUT /api/users/:id/salary
// @access  Private/Admin
const raiseUserSalary = async (req, res) => {
    const { newSalary } = req.body;
    const user = await User.findById(req.params.id);

    if (user && user.role === 'staff') {
        user.salary = newSalary;
        await user.save();
        res.json({ message: 'Salary updated successfully' });
    } else {
        res.status(404);
        throw new Error('Staff member not found');
    }
};

// @desc    Get all financial details for a single user
// @route   GET /api/users/:id/financials
// @access  Private/Admin
const getUserFinancialDetails = async (req, res) => {
    // THIS IS THE FIX: We wrap the entire logic in a try...catch block
    // to prevent the server from crashing on unexpected errors.
    try {
        // Add a check for a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error('Invalid user ID format');
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const payments = await Payment.find({ employee: req.params.id }).sort({ createdAt: -1 });
        const advances = await AdvanceRequest.find({ employee: req.params.id }).sort({ createdAt: -1 });

        res.json({
            user,
            payments,
            advances,
            bata: user.bata
        });
    } catch (error) {
        // Log the actual error on the server for debugging
        console.error('ERROR FETCHING FINANCIAL DETAILS:', error);
        // Send a clean error message to the frontend
        res.status(500).json({ message: error.message || 'Server error fetching financial details' });
    }
};


export { authUser, registerUser, getUsers, deleteUser, addUserBata, raiseUserSalary,getUserFinancialDetails };