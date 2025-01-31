import { personalMessageFunc } from "@/lib/Types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthUser } from "./authUserContext";
import { toast } from "react-toastify";

interface socketTypes {
  socket: WebSocket | null;
  sendPersonalMessage: (message: personalMessageFunc) => void;
  sendFriendRequest: (id: string) => void;
  searchFriend: (id: string) => void;
  isSignedIn: boolean;
  setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
  searchResult: any[];
}

const WebSocketContext = createContext<socketTypes | undefined>(undefined);

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const { authUser } = useAuthUser();

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

  const searchFriend = (username: string) => {
    if (!username || username.trim() === "") {
      if (searchResult.length > 0) setSearchResult([]);
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ username, event: "searchFriend" }));
    }
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
