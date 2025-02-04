import ws, { WebSocketServer } from "ws";
import * as cookie from "cookie";
import { validateToken } from "./token";
import Messages from "./Models/MessageModel";
import { uploadImageToClodinary } from "./utils";
import mongoose from "mongoose";
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
  attachedDocuments?: string[];
  attachedImages?: string[];
}

interface addFriendInterface {
  event: string;
  id: string;
}

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

          if (attachedImages && attachedImages?.length > 0) {
            try {
              const uploadImage = (img: string) => {
                return new Promise((resolve, reject) => {
                  const imgBuffer = Buffer.from(img, "base64");

                  const uploadStream = cloudinary.uploader.upload_stream(
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
          if (attachedVideo) {
            try {
              const uploadVideo = (vid: string) => {
                return new Promise((resolve, reject) => {
                  const vidBuffer = Buffer.from(vid, "base64");

                  const uploadStream = cloudinary.uploader.upload_stream(
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
              await uploadVideo(vid);
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

          const newMessage = new Messages({
            from,
            to,
            message,
            messageType,
            attachedImages: uploadedImages,
          });

          const savedMessage = await newMessage.save();

          const isOnline = usersMap.get(to);

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

          ws.send(
            JSON.stringify({
              friends: totalFriends[0].friends,
              event,
            })
          );
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
              },
              {
                from: id,
                to: userID,
              },
            ],
          }).sort({ createdAt: 1 });

          const chatInfo = {
            username: friendToChat.username,
            bio: friendToChat.bio,
            profilePicture: friendToChat.profilePicture,
            _id: friendToChat._id,
          };

          ws.send(
            JSON.stringify({
              currentChatInfo: { chatHistory, chatInfo },
              event,
            })
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
