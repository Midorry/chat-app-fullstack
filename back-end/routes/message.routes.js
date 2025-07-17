import express from "express";
import {
  sendMessage,
  getMessagesByConversation,
  markMessageAsSeen,
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:conversationId", authMiddleware, getMessagesByConversation);
router.patch("/seen", authMiddleware, markMessageAsSeen);

export default router;
