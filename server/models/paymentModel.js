// server/models/paymentModel.js
import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    advanceDeduction: { type: Number, required: true, default: 0 },
    bataPaid: { type: Number, required: true, default: 0 },
    finalPaid: { type: Number, required: true },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
