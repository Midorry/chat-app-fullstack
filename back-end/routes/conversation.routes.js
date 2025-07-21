import express from "express";
import {
  createConversation,
  createOneToOneConversation,
  getConversationById,
  getConversationsByUser,
} from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createConversation);
router.post("/create-one-to-one", authMiddleware, createOneToOneConversation);
router.get("/user/:userId", authMiddleware, getConversationsByUser);
router.get("/:id", authMiddleware, getConversationById);

export default router;
