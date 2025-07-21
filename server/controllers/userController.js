// server/controllers/userController.js
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

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
    const { fullname, username, password, role, staffRole, salary } = req.body;
    
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
        fullname,
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
            fullname: user.fullname,
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


export { authUser, registerUser, getUsers, deleteUser };