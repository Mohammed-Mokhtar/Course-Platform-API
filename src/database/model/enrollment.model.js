import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedSessions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "sessions",
    },
  },
  { timestamps: true },
);

export const Enrollment = mongoose.model("enrollments", enrollmentSchema);
