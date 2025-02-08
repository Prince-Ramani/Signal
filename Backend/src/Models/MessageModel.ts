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
    isReaded: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    attachedVideo: {
      required: false,
      type: String,
      default: "",
    },
    attachedDocuments: {
      required: false,
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          doc: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    attachedImages: {
      required: false,
      type: [String],
      default: [],
    },
    deletedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessageSchema);

export default Messages;
