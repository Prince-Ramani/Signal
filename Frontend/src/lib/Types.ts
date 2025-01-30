export interface userTypes {
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  blocked: string[];
  pendingFriendRequests: string[];
  blockedBy: string[];
  _id: string;
}

export interface personalMessage {
  event: "sendMessage";
  messageType: "Group" | "Personal";
  to: string;
  from: string;
  message: string;
  isReply?: string;
  attachedImages?: string[];
  attachedVideo?: string;
  attachedDocuments?: string[];
}

export interface personalMessageFunc {
  messageType: "Group" | "Personal";
  to: string;
  isReply?: string;
  message: string;
}
