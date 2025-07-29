import { ObjectId } from "mongodb";
import Message from "../models/message.model.js";

let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("join", ({ userId, conversationId }) => {
      socket.join(conversationId);
      socket.join(userId); // ✅ Join riêng room user
      console.log(
        `🔗 User ${socket.id} joined convo ${conversationId} and user ${userId}`
      );
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, message } = data;

      try {
        // Lưu tin nhắn vào DB
        const newMsg = await Message.create(message);

        // Gửi message cho người khác trong phòng (ví dụ B đang mở)
        socket.to(conversationId).emit("receiveMessage", newMsg);

        // Nếu sender đang mở cuộc trò chuyện, đánh dấu họ đã xem
        if (message.senderId) {
          await Message.updateOne(
            { _id: newMsg._id },
            { $addToSet: { seenBy: message.senderId } }
          );
        }

        // Cập nhật unseenCount và gửi cho receiver
        const receiverId = message.receiverId;

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

          // Gửi dữ liệu unseenCount về đúng socket của receiver
          io.to(receiverId).emit("unseenCountUpdated", unseenCounts);
        }
      } catch (err) {
        console.error("Error in sendMessage:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
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
        console.log("✅ Messages marked as seen:", result.modifiedCount);

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
