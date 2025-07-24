// server/routes/advanceRequestRoutes.js
import express from 'express';
const router = express.Router();
import { 
    createAdvanceRequest, 
    getAllAdvanceRequests, 
    updateAdvanceRequestStatus 
} from '../controllers/advanceRequestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, createAdvanceRequest)
  .get(protect, admin, getAllAdvanceRequests);

router.route('/:id').put(protect, admin, updateAdvanceRequestStatus);

export default router;
