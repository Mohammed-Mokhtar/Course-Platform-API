import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["video", "pdf"],
      required: true,
    },
    filePath: {
      type: String,
    },
    duration: {
      type: String,
    },
    passingScoreThreshold: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const Session = mongoose.model("sessions", sessionSchema);
