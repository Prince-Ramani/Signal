export interface userTypes {
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  blocked: string[];
  blockedBy: string[];
  _id: string;
}

export interface personalMessage {
  messageType: "Group" | "Personal";
  sendTo: string;
  message: string;
  isReply?: string;
  attachedImages?: string[];
  attachedVideo?: string;
  attachedDocuments?: string[];
  createdAt: string;
  updatedAt: string;
  _id: string;
}
