import jwt from "jsonwebtoken";
import { User } from "../../database/model/user.model.js";

export const auth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    const [bearer, realToken] = token.split(" ");
    const userId = jwt.verify(realToken, bearer);
    const user = await User.findById(userId._id);
    if (!user) return res.json({ message: "this user is not exist" });
    req.user = user;
    next();
  } catch (err) {
    res.json({ message: err.message });
  }
};

export const checkRole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.json({ message: "access denied" });
    }
    next();
  };
};
