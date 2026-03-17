const Message = require("../Models/Message");
let ioInstance;
let onlineUsers = {};
const socketHandler = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    console.log("A user Connected: ", socket.id);

    let userId = socket.handshake.query.userId;
    console.log("User ID: ", userId);

    onlineUsers[userId] = socket.id;

    socket.on("private_message", async (data) => {
      const { toUserId, message, msgType } = data;
      try {
        const toSocketId = onlineUsers[toUserId];
        const newMessage = new Message({
          sender: userId,
          receiver: toUserId,
          message: message,
          messageType: msgType,
        });
        await newMessage.save();
        if (toSocketId) {
          io.to(toSocketId).emit("receive_private_message", {
            from: userId,
              msg: message,
              messageId: newMessage._id,
            messageType: msgType
          });
        }
      } catch (error) {
        return console.error("Error saving message: ", error);
      }
    });
    socket.on("message_read", async (data) => {
      const { receiverId, senderId } = data;
      await Message.updateMany(
        {
          receiver: receiverId,
          sender: senderId,
          status: "sent",
          isDeleted: false,
        },
        { status: "read" },
      );
    });
    socket.on("disconnect", () => {
      console.log("A user Disconnected: ", socket.id);
      delete onlineUsers[userId];
    });
  });
};

const getIo = () => ioInstance;
const getOnlineUsers = () => onlineUsers;

module.exports = {socketHandler, getIo, getOnlineUsers};
