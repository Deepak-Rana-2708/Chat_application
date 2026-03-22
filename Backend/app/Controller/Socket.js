const Message = require("../Models/Message");
const { genrateAiResponse } = require("../Services/ai.services");
let ioInstance;
let onlineUsers = {};
const socketHandler = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    console.log("A user Connected: ", socket.id);

    let userId = socket.handshake.query.userId;

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
            messageType: msgType,
          });
        }
      } catch (error) {
        return console.error("Error saving message: ", error);
      }
    });
    socket.on("ai_msg", async (data) => {
      try {
        const { toUserId, message } = data;
        const newMessage = new Message({
          sender: userId,
          receiver: toUserId,
          message: message,
          messageType: "text",
        });
        await newMessage.save();
        // In this prompt first line is Role of AI and second line is Rule and then user input.
        const prompt = `
                You are a smart assistant of a chat application. 

                Rules:
                - Do not mention Gemini or Google
                - Answer in simple language
                - Be helpful and short

                User: ${message}
        `;
        const aiReply = await genrateAiResponse(prompt);
        console.log("Ai reply : ", aiReply);
        const aiMsg = await Message.create({
          sender: toUserId,
          receiver: userId,
          message: aiReply,
          messageType: "text",
        });
        socket.emit("receive_private_message", {
          from: toUserId,
          msg: aiMsg.message,
          messageId: aiMsg._id,
          messageType: "text",
        });
      } catch (error) {
        return console.error("Error Ai Chat: ", error);
      }
    });
    socket.on("mark_as_read", async (data) => {
      const { receiverId, senderId } = data;
      const status = await Message.updateMany(
        {
          receiver: receiverId,
          sender: senderId,
          status:  { $in: ["sent", "delivered"] },
          isDeleted: false,
        },
        { status: "read" },
      );
      const toSocketId = onlineUsers[senderId];
      if (toSocketId) {
        io.to(toSocketId).emit("message_read", {
          receiverId,
          senderId,
          status: "read",
        });
      }
    });
    socket.on("disconnect", () => {
      console.log("A user Disconnected: ", socket.id);
      delete onlineUsers[userId];
    });
  });
};

const getIo = () => ioInstance;
const getOnlineUsers = () => onlineUsers;

module.exports = { socketHandler, getIo, getOnlineUsers };
