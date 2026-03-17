import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    price: {
      type: Number,
    },
    thumbnail: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

courseSchema.virtual("sessions", {
  ref: "sessions",
  localField: "_id",
  foreignField: "courseId",
});

export const Course = mongoose.model("courses", courseSchema);
