import express from "express";
import {
  createConversation,
  getConversationsByUser,
} from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createConversation);
router.get("/:userId", authMiddleware, getConversationsByUser);

export default router;
