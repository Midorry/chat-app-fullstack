import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.post("/", createUser); // không cần auth nếu là signup

export default router;
