// server/models/advanceRequestModel.js
import mongoose from 'mongoose';

const advanceRequestSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AdvanceRequest = mongoose.model('AdvanceRequest', advanceRequestSchema);

export default AdvanceRequest;
