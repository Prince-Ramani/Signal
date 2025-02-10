import ws, { WebSocketServer } from "ws";
import * as cookie from "cookie";
import { validateToken } from "./token";
import Messages from "./Models/MessageModel";
import { uploadImageToClodinary } from "./utils";
import mongoose, { isValidObjectId } from "mongoose";
import User from "./Models/UserModel";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
interface sendMessageInterface {
  from: string;
  to: string;
  message: string;
  messageType: "Personal" | "Group";
  isReply?: string;
  attachedVideo?: string;
  attachedDocuments?: { name: string; doc: string }[];
  attachedImages?: string[];
}

interface addFriendInterface {
  event: string;
  id: string;
}

const IMAGE_FOLDER = "Signal/Photos";
const VIDEO_FOLDER = "Signal/Videos";
const DOCS_FOLDER = "Signal/Docs";

const deleteDocument = async (docId: string) => {
  const docID = docId.split("/").slice(-1)[0].split(".")[0];
  const ID = `${DOCS_FOLDER}/${docID}`;

  return cloudinary.uploader.destroy(ID, { resource_type: "raw" });
};

const deleteImage = async (imageId: string) => {
  const imgID = imageId.split("/").slice(-1)[0].split(".")[0];
  const ID = `${IMAGE_FOLDER}/${imgID}`;

  return cloudinary.uploader.destroy(ID, { resource_type: "image" });
};

const deleteVideo = async (videoId: string) => {
  const vidID = videoId.split("/").slice(-1)[0].split(".")[0];
  const ID = `${VIDEO_FOLDER}/${vidID}`;

  return cloudinary.uploader.destroy(ID, { resource_type: "video" });
};

export const setUpWebSocketServer = (wss: WebSocketServer) => {
  const usersMap = new Map<string, ws>();

  wss.on("connection", async (ws, req) => {
    var cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};

    if (!cookies.user) {
      ws.close(1008, "Unauthorized");
      return;
    }

    const userID = validateToken(cookies.user);

    if (!userID) {
      ws.close(1008, "Unauthorized");
      return;
    }

    usersMap.set(userID, ws);

    ws.on("message", async (message) => {
      try {
        const data = typeof message === "string" ? message : message.toString();
        const ev = JSON.parse(data);

        //sendmessage

        if (ev && ev.event === "sendMessage") {
          const {
            from,
            message,
            messageType,
            to,
            attachedDocuments,
            attachedImages,
            attachedVideo,
            isReply,
          }: sendMessageInterface = ev;

          const isOnline = usersMap.get(to);

          if (!from || !to || !message || !messageType) {
            ws.send(
              JSON.stringify({
                error: "Unauthorized",
                event: "getNotifications",
              })
            );
            return;
          }

          var uploadedImages: string[] = [];
          var uploadedVideo = "";
          var uploadedDocs: { name: string; doc: string }[] = [];

          if (attachedImages && attachedImages.length > 0) {
            try {
              const uploadImage = (img: string) => {
                return new Promise((resolve, reject) => {
                  const imgBuffer = Buffer.from(img, "base64");

                  const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "image", folder: IMAGE_FOLDER },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        if (result && result.secure_url) {
                          uploadedImages.push(result.secure_url);
                          resolve(result.secure_url);
                        } else {
                          reject(new Error("No secure URL returned"));
                        }
                      }
                    }
                  );

                  const readableStream = new Readable();
                  readableStream.push(imgBuffer);
                  readableStream.push(null);
                  readableStream.pipe(uploadStream);
                });
              };

              await Promise.all(attachedImages.map((img) => uploadImage(img)));
            } catch (err) {
              console.log("error uploading message images! : ", err);
              ws.send(
                JSON.stringify({
                  event: "getNotifications",
                  error: "Error uplaoding images. Make sure internet is ON! ",
                })
              );
            }
          }
          if (attachedVideo && attachedVideo.trim() !== "") {
            try {
              const uploadVideo = (vid: string) => {
                return new Promise((resolve, reject) => {
                  const vidBuffer = Buffer.from(vid, "base64");

                  const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "video", folder: VIDEO_FOLDER },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        if (result && result.secure_url) {
                          uploadedVideo = result.secure_url;
                          resolve(result.secure_url);
                        } else {
                          reject(new Error("No secure URL returned"));
                        }
                      }
                    }
                  );

                  const readableStream = new Readable();
                  readableStream.push(vidBuffer);
                  readableStream.push(null);
                  readableStream.pipe(uploadStream);
                });
              };
              await uploadVideo(attachedVideo);
            } catch (err) {
              console.log("error uploading message video! : ", err);
              ws.send(
                JSON.stringify({
                  event: "getNotifications",
                  error: "Error uplaoding video. Make sure internet is ON! ",
                })
              );
            }
          }

          if (attachedDocuments && attachedDocuments.length > 0) {
            try {
              const uploadDocs = (doc: { name: string; doc: string }) => {
                return new Promise((resolve, reject) => {
                  const docBuffer = Buffer.from(doc.doc, "base64");

                  const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "raw", folder: DOCS_FOLDER },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        if (result && result.secure_url) {
                          uploadedDocs.push({
                            doc: result.secure_url,
                            name: doc.name,
                          });
                          resolve(result.secure_url);
                        } else {
                          reject(new Error("No secure URL returned"));
                        }
                      }
                    }
                  );

                  const readableStream = new Readable();
                  readableStream.push(docBuffer);
                  readableStream.push(null);
                  readableStream.pipe(uploadStream);
                });
              };

              await Promise.all(
                attachedDocuments.map((doc) => uploadDocs(doc))
              );
            } catch (err) {
              console.log("error uploading message docs! : ", err);
              ws.send(
                JSON.stringify({
                  event: "getNotifications",
                  error:
                    "Error uplaoding documents. Make sure internet is ON! ",
                })
              );
            }
          }

          const newMessage = new Messages({
            from,
            to,
            message,
            messageType,
            attachedImages: uploadedImages,
            attachedVideo: uploadedVideo,
            attachedDocuments: uploadedDocs,
            status: isOnline ? "Sent" : "Pending",
          });

          const savedMessage = await newMessage.save();

          if (isOnline && isOnline.readyState === WebSocket.OPEN) {
            isOnline.send(
              JSON.stringify({
                message: savedMessage,
                event: "receiveMessage",
              })
            );
          }

          ws.send(
            JSON.stringify({ message: savedMessage, event: "sendMessage" })
          );

          return;
        }

        //deleteMessage
        if (ev && ev.event === "deleteMessage") {
          const { ids, toID } = ev;

          if (!toID) {
            ws.send(
              JSON.stringify({
                error: "Friend id requied!",
                event: "getNotifications",
              })
            );
            return;
          }

          if (ids && ids.length > 0) {
            const messages = await Messages.find({
              $or: [
                {
                  _id: { $in: ids },
                  from: userID,
                  to: toID,
                  deletedBy: { $nin: userID },
                },
                {
                  _id: { $in: ids },
                  from: toID,
                  to: userID,
                  deletedBy: { $nin: userID },
                },
              ],
            });

            if (!messages || messages.length === 0) {
              ws.send(
                JSON.stringify({
                  error: "No such message found!",
                  event: "getNotifications",
                })
              );
              return;
            }

            await Messages.updateMany(
              {
                $or: [
                  {
                    _id: { $in: ids },
                    from: userID,
                    to: toID,
                  },
                  {
                    _id: { $in: ids },
                    from: toID,
                    to: userID,
                  },
                ],
              },
              { $push: { deletedBy: new mongoose.Types.ObjectId(userID) } }
            );

            ws.send(
              JSON.stringify({
                message: "Messages deleted!",
                event: "deleteMessage",
                deletedMessages: ids,
              })
            );
            return;
          }

          await Messages.updateMany(
            {
              $or: [
                { from: userID, to: toID, deletedBy: { $nin: userID } },
                {
                  from: toID,
                  to: userID,
                  deletedBy: { $nin: userID },
                },
              ],
            },
            { $push: { deletedBy: new mongoose.Types.ObjectId(userID) } }
          );

          const messagesToDeletePermanently = await Messages.find({
            $or: [
              {
                from: userID,
                to: toID,
                deletedBy: { $all: [userID, toID] },
              },
              { to: userID, from: toID, deletedBy: { $all: [userID, toID] } },
            ],
          });

          var docsToDelete: any = [];
          var imagesToDelete: any = [];
          var videosToDelete: any = [];

          messagesToDeletePermanently.forEach((m) => {
            if (m.attachedDocuments && m.attachedDocuments.length > 0) {
              m.attachedDocuments.forEach((d) => {
                docsToDelete.push(deleteDocument(d.doc));
              });
            }

            if (m.attachedImages && m.attachedImages.length > 0) {
              m.attachedImages.forEach((i) => {
                imagesToDelete.push(deleteImage(i));
              });
            }

            if (m.attachedVideo) {
              videosToDelete.push(deleteVideo(m.attachedVideo));
            }
          });

          async function deleteAllAttachments() {
            try {
              const allPromises = [
                ...docsToDelete,
                ...imagesToDelete,
                ...videosToDelete,
              ];

              const results = await Promise.all(allPromises);
            } catch (error) {
              console.error("Error deleting some attachments:", error);
            }
          }

          deleteAllAttachments();

          await Messages.deleteMany({
            $or: [
              {
                from: userID,
                to: toID,
                deletedBy: { $all: [userID, toID] },
              },
              { to: userID, from: toID, deletedBy: { $all: [userID, toID] } },
            ],
          });

          ws.send(
            JSON.stringify({
              message: "Messages deleted!",
              event: "deleteMessage",
            })
          );
          return;
        }

        //send request

        if (ev && ev.event === "sendRequest") {
          try {
            const { id, event }: addFriendInterface = ev;
            if (!id || !mongoose.isValidObjectId(id)) {
              ws.send(JSON.stringify({ error: "No id found!", event }));
              return;
            }

            if (userID === id) {
              ws.send(
                JSON.stringify({
                  message: "You can't send frined request to youeself!",
                  event,
                })
              );
              return;
            }

            const user = await User.findById(id);

            if (!user) {
              ws.send(JSON.stringify({ error: "No such user found!", event }));
              return;
            }

            const hasAlreadySent = user.pendingFriendRequest.some(
              (p) => p.toString() === userID
            );

            if (hasAlreadySent) {
              ws.send(
                JSON.stringify({
                  message: "Friend request already sent!",
                  event,
                })
              );
              return;
            }

            user.pendingFriendRequest.push(new mongoose.Types.ObjectId(userID));

            await user.save();

            const isOnline = usersMap.get(id);

            if (isOnline && isOnline.readyState === WebSocket.OPEN) {
              isOnline.send(
                JSON.stringify({
                  message: ` ${user.username} just sent you a friend request request 🥳!`,
                  event: "getNotifications",
                })
              );
            }

            ws.send(
              JSON.stringify({
                message: "Friend request sent successfully!",
                event,
              })
            );
            return;
          } catch (err) {
            console.log("Error adding friend");
            return;
          }
        }

        //Accept request

        if (ev && ev.event === "acceptRequest") {
          try {
            const { id, event }: addFriendInterface = ev;

            if (!id || !mongoose.isValidObjectId(id)) {
              ws.send(JSON.stringify({ error: "No id found" }));
              return;
            }

            const user = await User.findById(userID);

            if (!user) {
              ws.send(JSON.stringify({ error: "No such user found!" }));
              return;
            }

            const hadSentRequest = user.pendingFriendRequest.some(
              (i) => i.toString() === id
            );

            if (!hadSentRequest) {
              ws.send(
                JSON.stringify({ error: "No such friend request found!" })
              );
              return;
            }

            const isAlreadyFriend = user.friends.some(
              (f) => f.toString() === id
            );
            if (isAlreadyFriend) {
              ws.send(JSON.stringify({ error: "You are already friends!" }));
              return;
            }

            const userToAccept = await User.findById(id);

            if (!userToAccept) {
              ws.send(JSON.stringify({ error: "No such person found!" }));
              return;
            }

            user.pendingFriendRequest = user.pendingFriendRequest.filter(
              (i) => i.toString() !== id
            );

            user.friends.push(new mongoose.Types.ObjectId(id));

            userToAccept.friends.push(new mongoose.Types.ObjectId(userID));

            await userToAccept.save();

            await user.save();

            const requesterSocket = usersMap.get(id);
            if (
              requesterSocket &&
              requesterSocket.readyState === WebSocket.OPEN
            ) {
              requesterSocket.send(
                JSON.stringify({
                  message: `${user.username} just accepted your friend request 🥳. Start chatting💬 now!`,
                  event: "getNotifications",
                })
              );
            }

            ws.send(
              JSON.stringify({ message: "Friend request accepted!", event })
            );
            return;
          } catch (err) {
            console.log("Error accepting request!", err);
          }
        }

        //remove friends

        if (ev && ev.event === "unfriend") {
          try {
            const { id, event }: addFriendInterface = ev;

            if (!id || !mongoose.isValidObjectId(id)) {
              ws.send(
                JSON.stringify({
                  error: "No id found",
                  event: "getNotifications",
                })
              );
              return;
            }

            const user = await User.findById(userID);

            if (!user) {
              ws.send(JSON.stringify({ error: "Unauthorized!" }));
              return;
            }

            const frinedToRemove = await User.findById(id);
            if (!frinedToRemove) {
              ws.send(JSON.stringify({ error: "No such user found!" }));
              return;
            }

            user.friends = user.friends.filter((f) => f._id.toString() !== id);

            frinedToRemove.friends = frinedToRemove.friends.filter(
              (f) => f._id.toString() !== userID
            );

            await frinedToRemove.save();
            await user.save();

            ws.send(
              JSON.stringify({
                message: `${frinedToRemove.username} removed from friends!`,
                event,
              })
            );
            return;
          } catch (err) {
            console.log(err);
            return;
          }
        }

        if (ev && ev.event === "searchFriend") {
          const { username, event } = ev;
          if (!username) {
            return;
          }
          const user = await User.findById(userID);
          if (!user) {
            ws.send("Your account doesn't exists!");
            return;
          }

          const searchResult = await User.find({
            $and: [
              {
                username: { $regex: `^${username}`, $options: "i" },
                $and: [
                  { _id: { $nin: user.blocked } },
                  { blocked: { $nin: userID } },
                ],
              },
            ],
          })
            .select(
              "username profilePicture _id bio friends pendingFriendRequest"
            )
            .lean();

          ws.send(JSON.stringify({ searchResult, event: "searchFriend" }));
          return;
        }

        if (ev && ev.event === "getNotifications") {
          const notifications = await User.find({ _id: userID })
            .select("pendingFriendRequest")
            .populate({
              path: "pendingFriendRequest",
              select: "username profilePicture bio _id",
            })
            .lean();

          ws.send(
            JSON.stringify({
              notifications: notifications[0].pendingFriendRequest,
              event: "getNotifications",
            })
          );
          return;
        }

        if (ev && ev.event === "getFriends") {
          const { event } = ev;
          const totalFriends = await User.find({ _id: userID })
            .select("friends")
            .populate({
              path: "friends",
              select: "username profilePicture bio _id",
            })
            .lean();

          const newMess = await Promise.all(
            totalFriends[0].friends.map(async (friend) => {
              const totalMess = await Messages.find({
                $or: [
                  {
                    from: friend._id,
                    to: userID,
                    deletedBy: { $nin: [userID] },
                  },
                  {
                    from: userID,
                    to: friend._id,
                    deletedBy: { $nin: [userID] },
                  },
                ],
              })
                .sort({ createdAt: 1 })
                .lean();

              let lastMessageType = "Text";

              const ls = totalMess[totalMess.length - 1];

              if (
                ls &&
                ls.attachedDocuments &&
                ls.attachedDocuments.length > 0
              ) {
                lastMessageType = "Document";
              }

              if (ls && ls.attachedImages && ls.attachedImages.length > 0) {
                lastMessageType = "Image";
              }

              if (ls && ls.attachedVideo) {
                lastMessageType = "Video";
              }

              let totalNewMessages = 0;

              if (ls)
                totalMess.forEach((u) => {
                  u.status !== "Seen" ? totalNewMessages++ : "";
                });

              const wasFromMe =
                ls && ls.from ? ls.from.toString() === userID : false;

              if (totalMess.length > 0)
                return {
                  ...friend,
                  totalNewMessages,
                  lastMessage: ls.message,
                  lastMessageType,
                  status: ls.status,
                  wasFromMe,
                };

              return { ...friend };
            })
          );

          await Messages.updateMany(
            { to: userID, status: "Pending" },
            { status: "Sent" }
          );

          ws.send(
            JSON.stringify({
              friends: newMess,
              event,
            })
          );
          return;
        }

        if (ev && ev.event === "seen") {
          const { id, event } = ev;
          if (!id || !isValidObjectId(id)) return;

          const updatedDoc = await Messages.findByIdAndUpdate(
            id,
            { status: "Seen" },
            { new: true }
          );

          if (updatedDoc) {
            const isOnline = usersMap.get(updatedDoc.from.toString());

            if (isOnline && isOnline.readyState === WebSocket.OPEN) {
              isOnline.send(
                JSON.stringify({
                  event: "seen",
                  message: updatedDoc,
                })
              );
              return;
            }
          }

          return;
        }

        if (ev && ev.event === "getHistory") {
          const { event, id } = ev;

          const friendToChat = await User.findById(id)
            .select("profilePicture _id username bio friends")
            .lean();

          if (!friendToChat) {
            ws.send(JSON.stringify({ error: "No such user found!", event }));
            return;
          }

          const isFriends = friendToChat.friends.some(
            (o) => o.toString() === userID
          );

          if (!isFriends) {
            ws.send(
              JSON.stringify({
                error: "No such friend found!",
                event: "getNotifications",
              })
            );
            return;
          }

          const chatHistory = await Messages.find({
            $or: [
              {
                from: userID,
                to: id,
                deletedBy: { $nin: userID },
              },
              {
                from: id,
                to: userID,
                deletedBy: { $nin: userID },
              },
            ],
          }).sort({ createdAt: 1 });

          await Messages.updateMany(
            {
              from: id,
              to: userID,
              status: { $in: ["Sent", "Pending"] },
            },
            { status: "Seen" },
            { new: true }
          );

          const chatInfo = {
            username: friendToChat.username,
            bio: friendToChat.bio,
            profilePicture: friendToChat.profilePicture,
            _id: friendToChat._id,
          };

          const isOnline = usersMap.get(id);

          if (isOnline && isOnline.readyState === WebSocket.OPEN) {
            isOnline.send(
              JSON.stringify({
                message: "All messages seen!",
                id,
                event: "seen",
              })
            );
          }
          ws.send(
            JSON.stringify({
              currentChatInfo: { chatHistory, chatInfo },
              event,
            })
          );
          return;
        }

        if (ev && ev.event === "addToFavourites") {
          const { id, event } = ev;

          if (!id || !isValidObjectId(id)) {
            ws.send(
              JSON.stringify({
                error: "Id required to add to favourite!",
                event: "getNotifications",
              })
            );
            return;
          }

          const userToAdd = await User.findById(id);

          if (!userToAdd) {
            ws.send(
              JSON.stringify({
                error: "NO such user found!",
                event: "getNotifications",
              })
            );
            return;
          }

          const me = await User.findById(userID);

          if (!me) {
            ws.send(
              JSON.stringify({
                error: "Unauthorized!",
                event: "getNotifications",
              })
            );
            return;
          }

          const isAlreadyInFavourites = me.favourites.some(
            (i) => i.toString() === id
          );

          if (isAlreadyInFavourites) {
            ws.send(
              JSON.stringify({
                message: `${userToAdd.username} is already in your favourites`,
                event: "getNotifications",
              })
            );
            return;
          }

          me.favourites.push(userToAdd._id);
          await me.save();
          ws.send(JSON.stringify({ message: userToAdd, event }));
          return;
        }

        if (ev && ev.event === "removeFromFavourites") {
          const { id, event } = ev;

          if (!id || !isValidObjectId(id)) {
            ws.send(
              JSON.stringify({
                error: "Id required to remove from favourite!",
                event: "getNotifications",
              })
            );
            return;
          }

          await User.findByIdAndUpdate(userID, {
            $pull: { favourites: id },
          });

          ws.send(JSON.stringify({ message: id, event }));
          return;
        }

        if (ev && ev.event === "getFavourites") {
          const { event } = ev;
          const favourites = await User.findById(userID)
            .select("favourites")
            .populate({
              path: "favourites",
              select: "username _id profilePicture bio",
            });

          ws.send(
            JSON.stringify({ favourites: favourites?.favourites || [], event })
          );
          return;
        }
      } catch (err) {
        console.log(err);
        ws.send(
          JSON.stringify({
            error: "Internal server error: Failed to parse the message.",
            event: "getNotifications",
          })
        );
      }
    });

    {
      /*end*/
    }

    ws.on("close", (code, reason) => {
      usersMap.delete(userID);
      console.log(
        "WebSocket connection closed with code : ",
        code,
        ", Reason : ",
        reason
      );
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });
};
