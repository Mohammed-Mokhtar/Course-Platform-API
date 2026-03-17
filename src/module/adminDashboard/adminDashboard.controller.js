import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { User } from "../../database/model/user.model.js";
import { Transaction } from "../../database/model/transaction.model.js";
import { Course } from "../../database/model/course.model.js";

const router = Router();

router.get("/stats", auth, checkRole("admin"), async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalTransactions = await Transaction.countDocuments();
  const totalCourses = await Course.countDocuments();
  const revenue = await Transaction.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.json({ totalUsers, totalTransactions, totalCourses, revenue });
});

export default router;
