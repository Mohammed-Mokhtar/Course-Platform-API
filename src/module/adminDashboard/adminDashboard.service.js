import { User } from "../../database/model/user.model.js";
import { Transaction } from "../../database/model/transaction.model.js";
import { Course } from "../../database/model/course.model.js";

export const getAdminStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalTransactions = await Transaction.countDocuments();
  const totalCourses = await Course.countDocuments();
  const revenue = await Transaction.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.json({ totalUsers, totalTransactions, totalCourses, revenue });
};
