import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { validate } from "../../common/utils/validation.js";
import {
  addSessionSchema,
  createCourseSchema,
  updateCourseSchema,
} from "./courses.validate.js";
import {
  addSession,
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  getCourseSessions,
  getMyCourses,
  subscribeToCourse,
  updateCourse,
} from "./courses.service.js";
import { upload } from "../../common/middleware/multer.js";

const router = Router();

router.get("/my", auth, checkRole("teacher"), getMyCourses);

router.post(
  "/",
  auth,
  upload.single("thumbnail"),
  checkRole("teacher"),
  validate(createCourseSchema),
  createCourse,
);

router.get("/", getCourses);

router.get("/:id", getCourseById);

router.delete("/:id", auth, checkRole("teacher"), deleteCourse);

router.put(
  "/:id",
  auth,
  checkRole("teacher"),
  validate(updateCourseSchema),
  updateCourse,
);

router.post(
  "/:courseId/sessions",
  upload.single("filePath"),
  auth,
  checkRole("teacher"),
  validate(addSessionSchema),
  addSession,
);

router.get(
  "/:courseId/sessions",
  auth,
  checkRole("teacher", "student"),
  getCourseSessions,
);

router.post(
  "/:id/subscribe",
  auth,
  checkRole("student"),

  subscribeToCourse,
);

export default router;

