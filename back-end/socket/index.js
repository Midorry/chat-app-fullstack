let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("join", (conversationId) => {
      socket.join(conversationId);
      console.log(`🔗 User ${socket.id} joined room ${conversationId}`);
    });

    socket.on("sendMessage", (data) => {
      const { conversationId, message } = data;
      socket.to(conversationId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};

export const getIO = () => ioInstance;
