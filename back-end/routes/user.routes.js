import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllUsersExceptMe,
  updateUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.post("/", createUser); // không cần auth nếu là signup
router.get("/all", authMiddleware, getAllUsersExceptMe);

router.put("/update", authMiddleware, updateUser);
router.get("/:id", authMiddleware, getUserById);

export default router;
