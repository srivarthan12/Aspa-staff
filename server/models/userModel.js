import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['staff', 'admin', 'superadmin'],
      default: 'staff',
    },
    photo: {
      type: String,
      required: false,
    },
    // --- Staff-specific fields ---
    staffRole: {
      type: String,
      required: function () { return this.role === 'staff'; },
    },
    salary: {
      type: Number,
      required: function () { return this.role === 'staff'; },
    },
    // We will add payment history and advance requests later
  },
  {
    timestamps: true, 
  }
)


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
