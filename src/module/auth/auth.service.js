import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../database/model/user.model.js";

export const register = async (req, res) => {
  try {
    let { name, email, password, role, cardNumber } = req.body;
    email = email.toLowerCase();
    if (role === "teacher" && !cardNumber)
      return res.json({ message: "a teacher must have a cardNumber" });

    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePicture = "";
    if (req.file) {
      profilePicture = `http://localhost:3000/uploads/images/${req.file.filename}`;
    }

    const addedUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      cardNumber,
      profilePicture,
    });
    res.json({ message: "userAddedSuccessfully", addedUser });
  } catch (err) {
    res.json({ message: err.message });
  }
};

export const login = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  const userExist = await User.findOne({ email });
  if (!userExist) return res.json({ message: "email or password are wrong" });
  const isPasswordMatched = await bcrypt.compare(password, userExist.password);
  if (!isPasswordMatched)
    return res.json({ message: "email or password are wrong" });

  const token = jwt.sign({ _id: userExist._id }, "bearer");

  res.json({ message: "user signedIn successfully", token });
};

