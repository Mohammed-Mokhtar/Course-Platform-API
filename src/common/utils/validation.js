import joi from "joi";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.json({
        details: error.details.map((item) => item.message),
      });
    }

    next();
  };
};
