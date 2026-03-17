import { Router } from "express";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { banUser, deleteUser, getUserById, getUsers, unbanUser } from "./users.service.js";

const router = Router();

router.get("/", auth, checkRole("admin"), getUsers);

router.get("/:id", auth, checkRole("admin"), getUserById);

router.patch("/:id/ban", auth, checkRole("admin"), banUser);

router.patch("/:id/unban", auth, checkRole("admin"), unbanUser);

router.delete("/:id", auth, checkRole("admin"), deleteUser);

export default router;
