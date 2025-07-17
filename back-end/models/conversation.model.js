import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String }, // tên nhóm (null nếu 1-1)
    avatar: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // lưu mảng id người dùng nếu 1-1 cũng vậy
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // lưu mảng id admin nếu 1-1 thì []
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
