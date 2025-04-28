import { Server } from "socket.io";

import mongoose from "mongoose";
import { Conversation, Message } from "../models/chat.model.js";

// Track online users
const onlineUsers = new Map();

export function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle user connection
    socket.on("user-connect", (userData) => {
      const { userId, userType } = userData;

      if (userId) {
        // Store user connection
        onlineUsers.set(userId, {
          socketId: socket.id,
          userType,
          isOnline: true,
        });

        // Broadcast user online status
        io.emit("user-status-change", {
          userId,
          isOnline: true,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Find and remove the disconnected user
      for (const [key, value] of onlineUsers.entries()) {
        if (value.socketId === socket.id) {
          onlineUsers.delete(key);

          // Broadcast user offline status
          io.emit("user-status-change", {
            userId: key,
            isOnline: false,
          });
          break;
        }
      }
    });

    // Handle sending messages
    socket.on("send-message", async (messageData) => {
      try {
        const { senderId, receiverId, text, senderType } = messageData;

        // Determine the other party's type
        const receiverType = senderType === "user" ? "doctor" : "user";

        // Find or create conversation
        let conversation;
        if (senderType === "user") {
          conversation = await Conversation.findOrCreateConversation(
            senderId,
            receiverId
          );
        } else {
          conversation = await Conversation.findOrCreateConversation(
            receiverId,
            senderId
          );
        }

        // Add message to conversation
        await conversation.addMessage({
          senderId,
          receiverId,
          text,
          senderType,
        });

        // Get the updated conversation with the new message
        const updatedConversation = await Conversation.findById(
          conversation._id
        );
        const newMessage =
          updatedConversation.messages[updatedConversation.messages.length - 1];

        // Emit the message to both sender and receiver
        io.emit("new-message", {
          conversationId: conversation._id,
          message: newMessage,
        });

        // Notify receiver about new message if online
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit("message-notification", {
            conversationId: conversation._id,
            message: newMessage,
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle getting chat history
    socket.on("get-chat-history", async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (conversation) {
          socket.emit("chat-history", {
            conversationId,
            messages: conversation.messages,
          });
        } else {
          socket.emit("chat-history", {
            conversationId,
            messages: [],
          });
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit("error", { message: "Failed to fetch chat history" });
      }
    });

    // Handle marking messages as read
    socket.on("mark-messages-read", async ({ conversationId, userId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (conversation) {
          await conversation.markAsRead(userId);

          // Find the other participant
          const otherParticipant = conversation.participants.find(
            (p) => p.id.toString() !== userId.toString()
          );

          // Notify the other participant if they're online
          if (otherParticipant) {
            const otherUserSocket = onlineUsers.get(
              otherParticipant.id.toString()
            );
            if (otherUserSocket) {
              io.to(otherUserSocket.socketId).emit("messages-read", {
                conversationId,
                userId,
              });
            }
          }

          socket.emit("messages-marked-read", { conversationId });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // Handle getting user conversations
    socket.on("get-conversations", async ({ userId }) => {
      try {
        const userConversations = await Conversation.find({
          "participants.id":new mongoose.Types.ObjectId(userId),
        }).sort({ "lastMessage.timestamp": -1 });

        socket.emit("user-conversations", { conversations: userConversations });
      } catch (error) {
        console.error("Error fetching conversations:", error);
        socket.emit("error", { message: "Failed to fetch conversations" });
      }
    });
  });

  return io;
}
