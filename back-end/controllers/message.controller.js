import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getIO } from "../socket/index.js";

// Gửi tin nhắn
export const sendMessage = async (req, res) => {
  const { conversationId, senderId, content, type, attachments } = req.body;

  try {
    const message = new Message({
      conversationId,
      senderId,
      content,
      type,
      attachments: attachments || [],
    });

    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: Date.now(), // để hỗ trợ sort theo thời gian hoạt động mới nhất
    });

    await message.populate("senderId", "username");

    const io = getIO();
    io.to(conversationId).emit("receiveMessage", message);

    res.status(201).json(message);
  } catch (err) {
    console.error("Lỗi khi gửi tin nhắn:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      fullError: err,
    });

    res.status(400).json({
      error: "Không thể gửi tin nhắn",
      details: err.message || err,
    });
  }
};

// Lấy tin nhắn theo conversationId
export const getMessagesByConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username avatar");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
};

// Đánh dấu tin nhắn đã xem
export const markMessageAsSeen = async (req, res) => {
  const { messageId, userId } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
      await message.save();
    }

    res.json(message);
  } catch (err) {
    res.status(400).json({ error: "Không thể cập nhật trạng thái đã xem" });
  }
};
