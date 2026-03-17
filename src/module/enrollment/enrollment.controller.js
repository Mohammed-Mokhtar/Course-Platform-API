import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { getMyEnrollments } from "./entrollment.service.js";

const router = Router();

router.get("/my", auth, checkRole("student"), getMyEnrollments);

export default router;
