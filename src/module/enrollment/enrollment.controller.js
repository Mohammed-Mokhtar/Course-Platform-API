import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { Enrollment } from "../../database/model/enrollment.model.js";

const router = Router();

router.get("/my", auth, checkRole("student"), async (req, res) => {
  const enrollment = await Enrollment.find({
    studentId: req.user._id,
  }).populate("courseId");
  if (!enrollment.length)
    return res.json({ message: "you don't have any enrolled courses" });
  res.json({ message: "courses found", enrollment });
});

export default router;
