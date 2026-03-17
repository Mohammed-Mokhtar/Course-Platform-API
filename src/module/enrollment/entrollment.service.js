import { Enrollment } from "../../database/model/enrollment.model.js";

export const getMyEnrollments = async (req, res) => {
  const enrollment = await Enrollment.find({
    studentId: req.user._id,
  }).populate("courseId");

  if (!enrollment.length) {
    return res.json({ message: "you don't have any enrolled courses" });
  }

  res.json({ message: "courses found", enrollment });
};
