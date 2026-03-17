import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { getAdminStats } from "./adminDashboard.service.js";

const router = Router();

router.get("/stats", auth, checkRole("admin"), getAdminStats);

export default router;
