// server/controllers/paymentController.js
import Payment from '../models/paymentModel.js';
import User from '../models/userModel.js'; // Ensure this import exists
import AdvanceRequest from '../models/advanceRequestModel.js';

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = async (req, res) => {
  const { employeeId, month, year } = req.body;
  const employee = await User.findById(employeeId);

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // --- Advance Deduction Logic ---
  const advance = await AdvanceRequest.findOne({ employee: employeeId, status: 'approved' });
  let advanceDeduction = 0;
  if (advance) {
    advanceDeduction = advance.amount;
    advance.status = 'processed';
    await advance.save();
  }

  // --- Bata Calculation Logic (Corrected) ---
  const pendingBata = employee.bata.filter(b => b.status === 'pending');
  const totalBata = pendingBata.reduce((sum, b) => sum + b.amount, 0);

  // --- Final Paid Calculation (Corrected) ---
  const finalPaid = (employee.salary - advanceDeduction) + totalBata;

  const payment = await Payment.create({
    employee: employeeId,
    month,
    year,
    baseSalary: employee.salary,
    advanceDeduction,
    bataPaid: totalBata, // Store the total bata
    finalPaid,
  });

  // Mark the processed bata as 'paid'
  employee.bata.forEach(b => {
      if (b.status === 'pending') {
          b.status = 'paid';
      }
  });
  await employee.save();

  res.status(201).json(payment);
};

// @desc    Get payment history for an employee
// @route   GET /api/payments/:employeeId
// @access  Private
const getMyPayments = async (req, res) => {
    if (req.user.role === 'staff' && req.user._id.toString() !== req.params.employeeId) {
        res.status(401);
        throw new Error('Not authorized to view this payment history');
    }
    const payments = await Payment.find({ employee: req.params.employeeId }).sort({ createdAt: -1 });
    res.json(payments);
};

// @desc    Get all payments for admin view
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    // FIX: Changed 'fullname' to 'username' to match your model
    const payments = await Payment.find({})
        .populate('employee', 'username staffRole')
        .sort({ createdAt: -1 });
    res.json(payments);
};

export { createPayment, getMyPayments, getAllPayments };
