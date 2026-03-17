import { Router } from "express";
import { validate } from "../../common/utils/validation.js";
import { loginSchema, signupSchema } from "./auth.validate.js";
import { login, register } from "./auth.service.js";
import { upload } from "../../common/middleware/multer.js";

const router = Router();

router.post(
  "/register",
  upload.single("profilePicture"),
  validate(signupSchema),
  register,
);

router.post("/login", validate(loginSchema), login);

export default router;

