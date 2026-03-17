import joi from "joi";

export const signupSchema = joi.object({
  name: joi.string().trim().min(2).max(50).required(),
  email: joi.string().trim().email().required(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[0-9]).{8,}$/,
      "password must be at least 8 char long and contains at least one number",
    )
    .min(6)
    .max(30)
    .required(),
  profilePicture: joi.string().trim().min(3).max(30).optional(),
  role: joi
    .string()
    .valid("student", "teacher", "admin")
    .default("student")
    .optional(),
  cardNumber: joi.string().min(16).max(16).optional(),
});

export const loginSchema = joi.object({
  email: joi.string().lowercase().trim().email().required(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[0-9]).{8,}$/,
      "password must be at least 8 char long and contains at least one number",
    )
    .min(6)
    .max(30)
    .required(),
});
