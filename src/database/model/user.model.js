import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
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
      enum: ["admin", "teacher", "student"],
      default: "student",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: {
      type: String,
    },
    cardNumber: {
      type: String,
      maxLength: 16,
      minLength: 16,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("users", userSchema);
