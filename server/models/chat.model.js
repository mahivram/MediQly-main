import mongoose from "mongoose";
// Individual Message Schema
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      type: { type: String, enum: ["user", "doctor"], required: true },
    },
    receiver: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      type: { type: String, enum: ["user", "doctor"], required: true },
    },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Conversation Schema
const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "participants.model",
        },
        model: { type: String, enum: ["User", "Doctor"], required: true },
        unreadCount: { type: Number, default: 0 },
      },
    ],
    lastMessage: {
      text: { type: String },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "lastMessage.senderModel",
      },
      senderModel: { type: String, enum: ["User", "Doctor"] },
      timestamp: { type: Date },
    },
    messages: [MessageSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create compound index for faster querying of participant conversations
ConversationSchema.index({ "participants.id": 1 });

// Method to add a message to conversation
ConversationSchema.methods.addMessage = function (messageData) {
  // Create a new message
  const newMessage = {
    sender: {
      id: messageData.senderId,
      type: messageData.senderType,
    },
    receiver: {
      id: messageData.receiverId,
      type: messageData.senderType === "user" ? "doctor" : "user",
    },
    text: messageData.text,
    read: false,
  };

  // Add message to the messages array
  this.messages.push(newMessage);

  // Update last message info
  this.lastMessage = {
    text: messageData.text,
    sender: messageData.senderId,
    senderModel: messageData.senderType === "user" ? "User" : "Doctor",
    timestamp: new Date(),
  };

  // Increment unread count for the receiver
  const receiverParticipant = this.participants.find(
    (p) => p.id.toString() === messageData.receiverId.toString()
  );

  if (receiverParticipant) {
    receiverParticipant.unreadCount += 1;
  }

  return this.save();
};

// Method to mark messages as read
ConversationSchema.methods.markAsRead = function (userId) {
  // Mark all messages as read where user is the receiver
  this.messages.forEach((message) => {
    if (message.receiver.id.toString() === userId.toString() && !message.read) {
      message.read = true;
      message.readAt = new Date();
    }
  });

  // Reset unread count for the user
  const userParticipant = this.participants.find(
    (p) => p.id.toString() === userId.toString()
  );

  if (userParticipant) {
    userParticipant.unreadCount = 0;
  }

  return this.save();
};

// Static method to find or create a conversation
ConversationSchema.statics.findOrCreateConversation = async function (
  userId,
  doctorId
) {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(doctorId)
  ) {
    throw new Error("Invalid userId or doctorId");
  }

  let conversation = await this.findOne({
    participants: {
      $all: [
        {
          $elemMatch: {
            id: new mongoose.Types.ObjectId(userId),
            model: "User",
          },
        },
        {
          $elemMatch: {
            id: new mongoose.Types.ObjectId(doctorId),
            model: "Doctor",
          },
        },
      ],
    },
  });

  if (!conversation) {
    conversation = new this({
      participants: [
        {
          id: new mongoose.Types.ObjectId(userId),
          model: "User",
          unreadCount: 0,
        },
        {
          id: new mongoose.Types.ObjectId(doctorId),
          model: "Doctor",
          unreadCount: 0,
        },
      ],
      messages: [],
    });

    await conversation.save();
  }

  return conversation;
};

export const Conversation = mongoose.model("Conversation", ConversationSchema);
export const Message = mongoose.model("Message", MessageSchema);
