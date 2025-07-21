import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllUsersExceptMe,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/all", authMiddleware, getAllUsersExceptMe);
router.get("/:id", authMiddleware, getUserById);
router.post("/", createUser); // không cần auth nếu là signup

export default router;
