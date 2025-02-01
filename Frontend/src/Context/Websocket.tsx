import { personalMessageFunc } from "@/lib/Types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthUser } from "./authUserContext";
import { toast } from "react-toastify";
import { useToast } from "@/hooks/use-toast";

interface socketTypes {
  socket: WebSocket | null;
  sendPersonalMessage: (message: personalMessageFunc) => void;
  sendFriendRequest: (id: string) => void;
  searchFriend: (id: string) => void;
  getNotifications: () => void;
  totalNotifications: any[];
  isSignedIn: boolean;
  acceptFriendRequest: (id: string) => void;
  setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
  searchResult: any[];
  removeFriend: (id: string) => void;
}

const WebSocketContext = createContext<socketTypes | undefined>(undefined);

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [totalNotifications, setTotalNotifcations] = useState<any[]>([]);
  const { authUser } = useAuthUser();
  const { toast: stoast } = useToast();

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

        console.log(event);

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
      };

      return () => newSocket.close();
    }

    if (!isSignedIn && socket) {
      socket.close();
      setSocket(null);
    }
  }, [isSignedIn]);

  const sendPersonalMessage = (messageToSend: personalMessageFunc) => {
    const { message, to } = messageToSend;

    if (!authUser || !authUser?._id) {
      toast.error("Unauthorized!");
      return;
    }

    if (!to) {
      toast.error("Recevier id not found!");
      return;
    }

    if (!message || message.trim() === "") {
      toast.error("Message content required");
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "sendMessage",
          ...messageToSend,
          from: authUser._id,
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
