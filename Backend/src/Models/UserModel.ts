import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default:
      "https://res.cloudinary.com/dwxzguawt/image/upload/v1735982611/m3rwtrv8z1yfxryyoew5_iwbxdw.png",
  },
  bio: {
    type: String,
    default: "Hey there! I'm using Signal. Let's chat!",
  },
  blocked: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  blockedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  friends: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  pendingFriendRequest: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  favourites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

export default User;
