import { ObjectId } from "mongodb";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

let ioInstance = null;
let onlineUsers = new Map();

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", ({ userId, conversationId }) => {
      socket.join(conversationId);
      socket.join(userId); // Join riêng room user
      console.log(
        `User ${socket.id} joined convo ${conversationId} and user ${userId}`
      );
    });

    socket.on("joinAll", async (userId) => {
      const conversations = await Conversation.find({
        participants: userId,
      }).select("_id");
      conversations.forEach((convo) => {
        socket.join(convo._id.toString());
      });
      socket.join(userId); // room riêng cho user
      // console.log(`User ${userId} joined all conversations and personal room`);
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, _id, senderId, receiverId } = data;
      try {
        const message = await Message.findById(_id);
        if (!message) return;

        // Đánh dấu seen cho người gửi
        if (senderId) {
          await Message.updateOne(
            { _id: message._id },
            { $addToSet: { seenBy: senderId } }
          );
        }

        // Gửi unseen count cho receiver
        if (receiverId) {
          const unseenCounts = await Message.aggregate([
            {
              $match: {
                seenBy: { $ne: receiverId },
                senderId: { $ne: receiverId },
              },
            },
            {
              $group: {
                _id: "$conversationId",
                unseenCount: { $sum: 1 },
              },
            },
            {
              $project: {
                conversationId: "$_id",
                unseenCount: 1,
                _id: 0,
              },
            },
          ]);

          io.to(receiverId).emit("unseenCountUpdated", unseenCounts);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("user-disconnected", async () => {
      const userId = [...onlineUsers.entries()].find(
        ([_, sId]) => sId === socket.id
      )?.[0];

      if (userId) {
        console.log("User disconnected:", userId);
        onlineUsers.delete(userId);

        await User.findByIdAndUpdate(userId, { online: false });

        // Gửi trạng thái offline cho tất cả user khác
        socket.broadcast.emit("user-status-changed", {
          userId: userId,
          online: false,
        });
      }
    });

    socket.on("user-connected", async (userId) => {
      console.log("User connected:", userId);
      onlineUsers.set(userId, socket.id);

      // Cập nhật trạng thái online trong DB (nếu cần)
      await User.findByIdAndUpdate(userId, { online: true });

      // Gửi trạng thái online cho tất cả các user khác
      socket.broadcast.emit("user-status-changed", {
        userId: userId,
        online: true,
      });
    });

    socket.on("updateUnseenCount", async (userId) => {
      try {
        const objectUserId = new ObjectId(userId);
        const unseenCounts = await Message.aggregate([
          {
            $match: {
              seenBy: { $ne: objectUserId },
              senderId: { $ne: objectUserId }, // Không đếm tin nhắn mình gửi
            },
          },
          {
            $group: {
              _id: "$conversationId",
              unseenCount: { $sum: 1 },
            },
          },
          {
            $project: {
              conversationId: "$_id",
              unseenCount: 1,
              _id: 0,
            },
          },
        ]);

        // Gửi kết quả về client
        socket.emit("unseenCountUpdated", unseenCounts);
      } catch (err) {
        console.error("Error updating unseen count:", err);
      }
    });

    socket.on("markAsSeen", async ({ userId, conversationId }) => {
      try {
        const objectUserId = new ObjectId(userId);
        // Cập nhật các tin nhắn chưa có userId trong seenBy
        const result = await Message.updateMany(
          {
            conversationId,
            seenBy: { $ne: objectUserId },
            senderId: { $ne: objectUserId }, // không đánh dấu tin nhắn mình gửi
          },
          {
            $addToSet: { seenBy: objectUserId },
          }
        );
        console.log("Messages marked as seen:", result.modifiedCount);

        // Sau khi đánh dấu đã xem xong, cập nhật lại unseenCount cho client
        const unseenCounts = await Message.aggregate([
          {
            $match: {
              seenBy: { $ne: objectUserId },
              senderId: { $ne: objectUserId },
            },
          },
          {
            $group: {
              _id: "$conversationId",
              unseenCount: { $sum: 1 },
            },
          },
          {
            $project: {
              conversationId: "$_id",
              unseenCount: 1,
              _id: 0,
            },
          },
        ]);

        socket.emit("unseenCountUpdated", unseenCounts);
      } catch (err) {
        console.error("Error marking as seen:", err);
      }
    });
  });
};

export const getIO = () => ioInstance;
