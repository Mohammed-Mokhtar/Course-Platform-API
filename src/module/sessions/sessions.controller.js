import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { addQuestionSchema } from "../questions/question.validate.js";
import { validate } from "../../common/utils/validation.js";
import {
  submitSessionQuizSchema,
  updateSessionSchema,
} from "./sessions.validate.js";
import {
  createSessionQuestion,
  deleteSession,
  getSessionById,
  getSessionPdf,
  getSessionQuestions,
  streamVideo,
  submitSessionQuiz,
  updateSession,
} from "./sessions.service.js";

const router = Router();

router.get("/:id", getSessionById);

router.put(
  "/:id",
  auth,
  checkRole("teacher"),
  validate(updateSessionSchema),
  updateSession,
);

router.delete("/:id", auth, checkRole("teacher"), deleteSession);

router.get("/:id/stream", auth, checkRole("teacher", "student"), streamVideo);
router.get("/:id/pdf", auth, checkRole("teacher", "student"), getSessionPdf);

router.post(
  "/:sessionId/questions",
  auth,
  checkRole("teacher"),
  validate(addQuestionSchema),
  createSessionQuestion,
);

router.get("/:sessionId/questions", auth, getSessionQuestions);

router.post(
  "/:sessionId/submit",
  auth,
  checkRole("student"),
  validate(submitSessionQuizSchema),
  submitSessionQuiz,
);

export default router;
