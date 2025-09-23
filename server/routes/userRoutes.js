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
import upload from '../middleware/uploadMiddleware.js'; // Import multer middleware

router.route('/').get(protect, admin, getUsers);

// Add the upload middleware here. It will look for a field named 'photo'
router.route('/register').post(protect, admin, upload.single('photo'), registerUser);

router.post('/login', authUser);

router.route('/:id').delete(protect, superadmin, deleteUser);
router.route('/:id/bata').post(protect, admin, addUserBata);
router.route('/:id/salary').put(protect, admin, raiseUserSalary);
router.route('/:id/financials').get(protect, admin, getUserFinancialDetails);

export default router;
