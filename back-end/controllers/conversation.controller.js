import mongoose from "mongoose";
import conversationModel from "../models/conversation.model.js";
import Conversation from "../models/conversation.model.js";
import messageModel from "../models/message.model.js";

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

export const createOneToOneConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id; // id người dùng đang đăng nhập (từ middleware xác thực JWT)
    const targetUserId = req.body.userId; // id của người mà muốn nhắn tin

    if (!targetUserId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Kiểm tra xem đã có conversation 1-1 giữa 2 user chưa
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      members: { $all: [currentUserId, targetUserId], $size: 2 },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Tạo mới conversation
    const newConversation = new Conversation({
      isGroup: false,
      members: [currentUserId, targetUserId],
      admins: [],
      createdBy: currentUserId,
    });

    await newConversation.save();

    return res.status(201).json(newConversation);
  } catch (error) {
    console.error("Lỗi khi tạo 1-1 conversation:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
// Lấy tất cả cuộc trò chuyện của 1 người dùng
export const getConversationsByUser = async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.params.userId);

  try {
    const conversations = await Conversation.aggregate([
      {
        $match: {
          members: currentUserId,
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { convoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$convoId"] },
                    { $ne: ["$senderId", currentUserId] },
                    { $not: { $in: [currentUserId, "$seenBy"] } },
                  ],
                },
              },
            },
          ],
          as: "unseenMessages",
        },
      },
      {
        $addFields: {
          unseenCount: { $size: "$unseenMessages" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "membersInfo",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessageInfo",
        },
      },
      {
        $unwind: {
          path: "$lastMessageInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessageInfo.senderId",
          foreignField: "_id",
          as: "lastMessageSender",
        },
      },
      {
        $unwind: {
          path: "$lastMessageSender",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          isGroup: 1,
          unseenCount: 1,
          members: "$membersInfo",
          lastMessage: {
            _id: "$lastMessageInfo._id",
            content: "$lastMessageInfo.content",
            createdAt: "$lastMessageInfo.createdAt",
            seenBy: "$lastMessageInfo.seenBy",
            attachments: "$lastMessageInfo.attachments",
            type: "$lastMessageInfo.type",
            senderId: {
              _id: "$lastMessageSender._id",
              username: "$lastMessageSender.username",
              avatar: "$lastMessageSender.avatar",
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Format lại để tách "otherMember"
    const formatted = conversations.map((c) => {
      const otherMember = c.members.find(
        (m) => m._id.toString() !== req.params.userId
      );

      return {
        _id: c._id,
        isGroup: c.isGroup,
        unseenCount: c.unseenCount,
        lastMessage: c.lastMessage,
        otherMember: otherMember
          ? {
              _id: otherMember._id,
              username: otherMember.username,
              avatar: otherMember.avatar,
              email: otherMember.email,
            }
          : null,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách cuộc hội thoại" });
  }
};

export const getConversationById = async (req, res) => {
  const { id } = req.params; // conversationId

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "conversationId không hợp lệ" });
    }

    const conversation = await conversationModel
      .findById(id)
      .populate("members", "username email avatar")
      .populate("admins", "username email avatar")
      .populate("createdBy", "username email avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "username email avatar" },
      });

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy conversation" });
    }

    // Optionally: lấy tất cả messages
    const messages = await messageModel
      .find({ conversationId: id })
      .populate("senderId", "username email avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({ conversation, messages });
  } catch (err) {
    console.error("Lỗi getConversationById:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
