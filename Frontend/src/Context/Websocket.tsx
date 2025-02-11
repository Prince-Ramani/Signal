import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuthUser } from "./authUserContext";
import { toast } from "react-toastify";
import { useToast } from "@/hooks/use-toast";

interface socketTypes {
  socket: WebSocket | null;
  sendPersonalMessage: (message: {
    message: string;
    to: string;
    attachedImages: string[];
  }) => void;
  sendFriendRequest: (id: string) => void;
  getHistory: (id: string) => void;
  searchFriend: (id: string) => void;
  getNotifications: () => void;
  getFriends: () => void;
  sendSignal: (message: any) => void;

  totalNotifications: any[];
  currentChat: any;

  totalFriends: any[];
  setTotalFriends: any;
  getFavourites: () => void;

  isSignedIn: boolean;
  acceptFriendRequest: (id: string) => void;
  addToFavourites: (id: string) => void;

  removeFromFavourites: (id: string) => void;
  favourites: any[];

  setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentChat: React.Dispatch<React.SetStateAction<any>>;
  deleteMessages: (id: string[] | undefined, toID: string) => void;

  setIsChatting: React.Dispatch<React.SetStateAction<boolean>>;
  currentChatRef: any;
  isChatting: boolean;
  isOnCall: {
    username: string;
    _id: string;
    profilePicture: string;
  } | null;

  setIsOnCall: React.Dispatch<
    React.SetStateAction<{
      username: string;
      _id: string;
      profilePicture: string;
    } | null>
  >;

  searchResult: any[];
  removeFriend: (id: string) => void;
}

const WebSocketContext = createContext<socketTypes | undefined>(undefined);

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [totalNotifications, setTotalNotifcations] = useState<any[]>([]);
  const [totalFriends, setTotalFriends] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>("");
  const currentChatRef = useRef<any>(null);
  const [isOnCall, setIsOnCall] = useState<{
    username: string;
    _id: string;
    profilePicture: string;
  } | null>(null);

  const [isChatting, setIsChatting] = useState(false);
  const [favourites, setFavourites] = useState<any[]>([]);

  const { authUser } = useAuthUser();
  const { toast: stoast } = useToast();

  useEffect(() => {
    if (currentChat && "chatInfo" in currentChat) {
      currentChatRef.current = currentChat.chatInfo._id;
    }
  }, [currentChat]);

  useEffect(() => {
    if (isSignedIn && !socket) {
      const newSocket = new WebSocket("ws://localhost:8000");
      setSocket(newSocket);

      newSocket.onopen = (socket) => {
        console.log("WebSocket connected", socket);
      };
      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newSocket.onclose = (event) => {
        console.log("WebSocket closed:", event);
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event === "searchFriend" && data.searchResult) {
          setSearchResult(data.searchResult);
        }

        if (data.event === "sendRequest") {
          if (data.error) {
            toast.error(data.error);
            return;
          }

          if (data.message) {
            toast.success(data.message);
          }
        }

        if (data.event === "getNotifications") {
          if ("message" in data) {
            stoast({ title: data.message });
            return;
          }

          if ("notifications" in data) {
            toast.success(data.notifications);
            setTotalNotifcations(data.notifications);
          }
        }

        if (data.event === "acceptRequest" && data.message) {
          toast.success(data.message);
          return;
        }

        if (data.event === "unfriend") {
          if (data.error) {
            toast.error(data.error);
            return;
          }
          toast.success(data.message);
          return;
        }
        if (data.event === "getFriends") {
          if (data.error) {
            toast.error(data.error);
            return;
          }

          if ("friends" in data) {
            setTotalFriends(data.friends);
          }

          return;
        }

        if (data.event === "deleteMessage") {
          if (
            data.message === "Messages deleted!" &&
            data.deletedMessages &&
            data.deletedMessages.length > 0
          ) {
            setCurrentChat((prev: any) => ({
              ...prev,
              chatHistory: prev.chatHistory.filter(
                (p: any) => !data.deletedMessages.includes(p._id)
              ),
            }));

            toast.success(data.message);
            return;
          }

          if (data.message === "Messages deleted!") {
            setCurrentChat((prev: any) => ({ ...prev, chatHistory: [] }));
            return;
          }
        }
        if (data.event === "getHistory") {
          if ("currentChatInfo" in data) {
            setCurrentChat(data.currentChatInfo);
            setIsChatting(true);
            return;
          }
        }

        if (data.event === "addToFavourites") {
          if ("message" in data) {
            const isAlreadyInFavourites = favourites.some(
              (i) => i._id.toString() === data.message._id
            );
            if (data.message._id && !isAlreadyInFavourites) {
              setFavourites((prev: any) => [...prev, data.message]);
              toast.success(`${data.message.username} added to favourites!`);
              return;
            }
            return;
          }
        }

        if (data.event === "removeFromFavourites") {
          if ("message" in data) {
            setFavourites((prev: any) =>
              prev.filter((i: any) => i._id !== data.message)
            );
            toast.success("Removed");
            return;
          }
        }

        if (data.event === "removeFromFavourites") {
          if ("message" in data) {
            if (data.message._id) {
              setFavourites((prev: any) =>
                prev.filter((i: any) => i._id !== data.message._id)
              );
              toast.success(`Removed from favourites!`);
              return;
            }
            return;
          }
        }

        if (data.event === "seen" && "message" in data) {
          const mess = data.message;

          const id = data.id;

          const cc = currentChatRef.current;
          const from = mess.from;
          const to = mess.to;

          if (cc && id && cc === id && mess === "All messages seen!") {
            setCurrentChat((p: any) => {
              const update = p.chatHistory.map((message: any) => {
                return { ...message, status: "Seen" };
              });

              return { ...p, chatHistory: update };
            });

            return;
          }

          if (cc && from && (cc === from || cc === to)) {
            setCurrentChat((prevChat: any) => {
              const update = prevChat.chatHistory.map((message: any) => {
                if (message._id === mess._id) return mess;
                return message;
              });
              return { ...prevChat, chatHistory: update };
            });
          }

          return;
        }

        if (data.event === "receiveMessage" && data.message) {
          const mess = data.message;

          const cc = currentChatRef.current;
          const from = mess.from;

          if (cc && from && cc === from) {
            const chat = {
              ...mess,
            };

            setCurrentChat((prevChat: any) => {
              return {
                ...prevChat,
                chatHistory: [...prevChat?.chatHistory, chat],
              };
            });
            newSocket.send(JSON.stringify({ event: "seen", id: chat._id }));
            return;
          }

          setTotalFriends((prev: any) => {
            const data = prev.map((friend: any) => {
              if (friend._id === mess.from) {
                const lastMessageType =
                  mess.attachedDocuments.length > 0
                    ? "Document"
                    : mess.attachedImages.length > 0
                    ? "Image"
                    : mess.attachedVideo
                    ? "Video"
                    : "Text";

                return {
                  ...friend,
                  lastMessage: mess.message,
                  totalNewMessages: friend.totalNewMessages + 1 || 1,
                  wasFromMe: false,
                  lastMessageType,
                  status: mess.status,
                };
              }
              return friend;
            });
            return data;
          });

          stoast({ title: `New message` });
        }

        if (data.event === "getFavourites" && data.favourites) {
          setFavourites(data.favourites);
        }

        if (data.event === "sendMessage" && data.message) {
          const mess = data.message;

          const cc = currentChatRef.current;
          const to = mess.to;

          if (cc && to && cc === to) {
            const chat = {
              ...mess,
            };

            setCurrentChat((prevChat: any) => {
              return {
                ...prevChat,
                chatHistory: [...prevChat?.chatHistory, chat],
              };
            });
            return;
          }
        }
      };

      return () => newSocket.close();
    }

    if (!isSignedIn && socket) {
      socket.close();
      setSocket(null);
    }
  }, [isSignedIn]);

  const sendPersonalMessage = (messageToSend: {
    message: string;
    to: string;
    attachedImages: string[];
  }) => {
    const { message, to, attachedImages } = messageToSend;

    if (!authUser || !authUser?._id) {
      toast.error("Unauthorized!");
      return;
    }

    if (!to) {
      toast.error("Recevier id not found!");
      return;
    }

    if ((!message || message.trim()) === "" && attachedImages.length === 0) {
      toast.error("Message content required");
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "sendMessage",
          ...messageToSend,
          from: authUser._id,
          messageType: "Personal",
        })
      );
    }
  };

  const sendFriendRequest = (id: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id, event: "sendRequest" }));
    }
  };

  const acceptFriendRequest = (id: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id, event: "acceptRequest" }));
    }
  };
  const removeFriend = (id: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id, event: "unfriend" }));
    }
  };

  const searchFriend = (username: string) => {
    if (!username || username.trim() === "") {
      if (searchResult.length > 0) setSearchResult([]);
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ username, event: "searchFriend" }));
    }
  };

  const getNotifications = () => {
    if (socket && socket.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ event: "getNotifications" }));
  };

  const getFriends = () => {
    if (socket && socket.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ event: "getFriends" }));
  };

  const getHistory = (id: string) => {
    if (socket && socket.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ event: "getHistory", id }));
  };

  const deleteMessages = (id: string[] | undefined, toID: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (id && id.length > 0) {
        socket.send(JSON.stringify({ ids: id, event: "deleteMessage", toID }));
        return;
      }
      socket.send(JSON.stringify({ event: "deleteMessage", toID }));
    }
  };

  const addToFavourites = (id: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id, event: "addToFavourites" }));
    }
  };

  const removeFromFavourites = (id: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id, event: "removeFromFavourites" }));
    }
  };

  const getFavourites = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event: "getFavourites" }));
    }
  };

  const sendSignal = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isOnCall,
        setIsOnCall,
        sendPersonalMessage,
        getFavourites,
        setIsSignedIn,
        sendSignal,
        favourites,
        isSignedIn,
        sendFriendRequest,
        searchFriend,
        searchResult,
        getNotifications,
        totalNotifications,
        acceptFriendRequest,
        removeFriend,
        totalFriends,
        getFriends,
        getHistory,
        currentChat,
        setIsChatting,
        isChatting,
        addToFavourites,
        removeFromFavourites,
        setCurrentChat,
        deleteMessages,
        setTotalFriends,
        currentChatRef,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebsocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebsocket must be used within a WebSocketProvider");
  }
  return context;
};

export default WebSocketProvider;
