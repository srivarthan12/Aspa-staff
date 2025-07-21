// server/routes/advanceRequestRoutes.js
import express from 'express';
const router = express.Router();
import { 
    createAdvanceRequest, 
    getAllAdvanceRequests, 
    updateAdvanceRequestStatus 
} from '../controllers/advanceRequestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Staff can create a request, Admins can get all requests
router.route('/')
  .post(protect, createAdvanceRequest)
  .get(protect, admin, getAllAdvanceRequests);

// Admins can update a request
router.route('/:id').put(protect, admin, updateAdvanceRequestStatus);

export default router;
