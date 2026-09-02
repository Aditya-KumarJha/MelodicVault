import mongoose from 'mongoose';

const fullNameSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    passwordHash: {
      type: String,
      required() {
        return (this.provider || 'email') === 'email';
      },
      default: null,
    },
    fullName: { type: fullNameSchema, required: true },
    provider: {
      type: String,
      enum: ['email', 'google', 'github'],
      default: 'email',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { username: { $type: 'string' } },
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
