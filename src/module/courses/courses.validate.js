import joi from "joi";

export const createCourseSchema = joi.object({
  title: joi.string().trim().min(3).max(120).required(),
  description: joi.string().trim().min(10).max(2000).required(),
  price: joi.number().min(0).required(),
  thumbnail: joi.string().trim().optional(),
  category: joi.string().trim().lowercase().min(3).max(50).required(),
});

export const updateCourseSchema = joi
  .object({
    title: joi.string().trim().min(3).max(120).optional(),
    description: joi.string().trim().min(10).max(2000).optional(),
    price: joi.number().min(0).optional(),
    thumbnail: joi.string().trim().uri().optional(),
    category: joi.string().trim().lowercase().min(3).max(50).optional(),
  })
  .min(1);

export const addSessionSchema = joi.object({
  title: joi.string().trim().min(3).max(120).required(),
  contentType: joi.string().valid("video", "pdf").required(),
  duration: joi.string().trim().min(1).max(50).required(),
  passingScoreThreshold: joi.number().min(0).max(100).required(),
});

export const subscribeToCourseSchema = joi.object({
  cardNumber: joi.string().trim().length(16).optional(),
});
