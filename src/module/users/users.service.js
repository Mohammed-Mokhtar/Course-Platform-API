import { User } from "../../database/model/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: "fond users", users });
  } catch (err) {}
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.json({ message: "user is not exist" });
  res.json({ message: "user found", user });
};

export const banUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const user = await User.findById(id);
  if (!user) return res.json({ message: "user not found " });
  if (!user.isActive) return res.json({ message: "user already banned" });
  user.isActive = false;
  await user.save();
  return res.json({ message: "user banned successfully" });
};

export const unbanUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const user = await User.findById(id);
  if (!user) return res.json({ message: "user not found " });
  if (user.isActive) return res.json({ message: "user already not banned" });
  user.isActive = true;
  await user.save();
  return res.json({ message: "user unbanned successfully" });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.json({ message: "user not found " });
  return res.json({ message: "user deleted successfully" });
};
