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

  totalNotifications: any[];
  currentChat: any;

  totalFriends: any[];

  isSignedIn: boolean;
  acceptFriendRequest: (id: string) => void;
  setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentChat: React.Dispatch<React.SetStateAction<any>>;

  setIsChatting: React.Dispatch<React.SetStateAction<boolean>>;
  isChatting: boolean;

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
  const [currentChat, setCurrentChat] = useState<any>();
  const currentChatRef = useRef<any>(null);
  const [isChatting, setIsChatting] = useState(false);

  const { authUser } = useAuthUser();
  const { toast: stoast } = useToast();

  useEffect(() => {
    if (currentChat) {
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
        console.log(data);

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

        if (data.event === "getHistory") {
          if ("currentChatInfo" in data) setCurrentChat(data.currentChatInfo);
          setCurrentChat(data.currentChatInfo);
          setIsChatting(true);
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
            return;
          }

          stoast({ title: `New message` });
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

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        sendPersonalMessage,
        setIsSignedIn,
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
        setCurrentChat,
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
