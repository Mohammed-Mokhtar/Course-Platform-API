import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { validate } from "../../common/utils/validation.js";
import { updateQuestionSchema } from "./question.validate.js";
import { deleteQuestion, updateQuestion } from "./question.service.js";

const router = Router();

router.put("/:id", auth, checkRole("teacher"), validate(updateQuestionSchema), updateQuestion);

router.delete("/:id", auth, checkRole("teacher"), deleteQuestion);

export default router;
