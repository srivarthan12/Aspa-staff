// server/models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define a schema for individual bata payments
const bataSchema = mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: false },
    // THIS STATUS FIELD IS CRUCIAL FOR THE LOGIC TO WORK
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
});

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['staff', 'admin', 'superadmin'], default: 'staff' },
    photo: { type: String, required: false },
    staffRole: { type: String, required: function () { return this.role === 'staff'; } },
    salary: { type: Number, required: function () { return this.role === 'staff'; } },
    bata: [bataSchema]
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
