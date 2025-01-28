import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ["Group", "Personal"],
      default: "Personal",
    },

    isReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      required: false,
      deault: "",
    },

    attachedVideo: {
      required: false,
      type: String,
      default: "",
    },
    attachedDocuments: {
      required: false,
      type: [String],
      default: [],
    },
    attachedImages: {
      required: false,
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessageSchema);

export default Messages;
