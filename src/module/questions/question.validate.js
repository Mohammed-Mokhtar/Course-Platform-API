import joi from "joi";

export const addQuestionSchema = joi.object({
  text: joi.string().min(2).max(100).required(),
  options: joi
    .array()
    .items(joi.string().min(2).max(100).required())
    .min(2)
    .max(5)
    .required(),
  correctAnswerIndex: joi.number().integer().min(0).max(4).required(),
});
