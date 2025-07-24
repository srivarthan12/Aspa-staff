// server/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  getUsers,
  deleteUser,
  addUserBata,
  raiseUserSalary,
  getUserFinancialDetails
} from '../controllers/userController.js';
import { protect, admin, superadmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// A user must be a logged-in admin to get all users or register a new one
router.route('/').get(protect, admin, getUsers);
router.route('/register').post(protect, admin, upload.single('photo'), registerUser);

// Public login route
router.post('/login', authUser);

// A user must be a logged-in superadmin to delete another user
router.route('/:id').delete(protect, superadmin, deleteUser);

// New Routes for bata and salary
router.route('/:id/bata').post(protect, admin, addUserBata);
router.route('/:id/salary').put(protect, admin, raiseUserSalary);

// New Route for detailed history
router.route('/:id/financials').get(protect, admin, getUserFinancialDetails);

export default router;
