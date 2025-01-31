import ws, { WebSocketServer } from "ws";
import * as cookie from "cookie";
import { validateToken } from "./token";
import Messages from "./Models/MessageModel";
import { uploadImageToClodinary } from "./utils";
import mongoose from "mongoose";
import User from "./Models/UserModel";

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
            ws.send(JSON.stringify({ error: "Unauthorized" }));
            return;
          }

          const newMessage = new Messages({
            from,
            to,
            message,
            messageType,
          });

          const savedMessage = await newMessage.save();

          await savedMessage.populate({
            path: "from",
            select: "username profilePicture",
          });

          const isOnline = usersMap.get(to);

          if (isOnline && isOnline.readyState === WebSocket.OPEN) {
            isOnline.send(JSON.stringify(savedMessage));
          }

          ws.send("Message sent!");
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

            console.log(user);

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
              ws.send(JSON.stringify({ error: "No id found" }));
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
      } catch (err) {
        console.log(err);
        ws.send(
          JSON.stringify({
            error: "Internal server error: Failed to parse the message.",
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
