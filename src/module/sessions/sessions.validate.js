import joi from "joi";

export const updateSessionSchema = joi
  .object({
    title: joi.string().trim().min(3).max(120).optional(),
    contentType: joi.string().valid("video", "pdf").optional(),
    duration: joi.string().trim().min(1).max(50).optional(),
  })
  .min(1);

export const submitSessionQuizSchema = joi.object({
  answers: joi.array().items(joi.number().integer().min(1).required()).min(1).required(),
});
