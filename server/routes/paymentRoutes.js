// server/routes/paymentRoutes.js
import express from 'express';
const router = express.Router();
import { createPayment, getMyPayments, getAllPayments } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, admin, createPayment)
    .get(protect, admin, getAllPayments);

// THIS IS THE CRUCIAL ROUTE THAT WAS MISSING ON YOUR DEPLOYED SERVER
router.route('/:employeeId').get(protect, getMyPayments);

export default router;
