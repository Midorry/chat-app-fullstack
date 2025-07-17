import Conversation from "../models/conversation.model.js";

// Tạo cuộc trò chuyện mới (1-1 hoặc nhóm)
export const createConversation = async (req, res) => {
  const { name, type, members, admins } = req.body;

  try {
    const newConversation = new Conversation({
      name,
      type,
      members,
      admins: admins || [],
    });

    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (err) {
    res.status(400).json({ error: "Không thể tạo cuộc trò chuyện" });
  }
};

// Lấy tất cả cuộc trò chuyện của 1 người dùng
export const getConversationsByUser = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.params.userId,
    }).populate("members", "-password");

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách cuộc trò chuyện" });
  }
};
