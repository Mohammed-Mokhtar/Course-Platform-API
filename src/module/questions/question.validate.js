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

export const updateQuestionSchema = joi
  .object({
    text: joi.string().min(2).max(100).optional(),
    options: joi
      .array()
      .items(joi.string().min(2).max(100).required())
      .min(2)
      .max(5)
      .optional(),
    correctAnswerIndex: joi.number().integer().min(1).max(5).optional(),
  })
  .min(1);
