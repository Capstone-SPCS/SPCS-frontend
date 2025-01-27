import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Define the type of events we expect from the server
interface ServerToClientEvents {
  message: (data: any) => void;
}

// Define the type of events we send to the server
interface ClientToServerEvents {
  sendMessage: (data: any) => void;
}

export const useWebSocketClient = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();

  useEffect(() => {
    // Initialize the socket connection
    const socket = io(url);

    socketRef.current = socket;

    // Listen for connection events
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    });

    // Listen for 'cdmProcessed' updates
    socket.on("cdmProcessed", (data) => {
      console.log("Received cdmProcessed event:", data);
      setMessages((prevUpdates) => [...prevUpdates, data]);
    });

    return () => {
      // Clean up the socket connection on unmount
      socket.disconnect();
    };
  }, [url]);

  // Function to send a message to the server
  const sendMessage = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", data);
    } else {
      console.error("Socket is not connected.");
    }
  };

  return { isConnected, messages, sendMessage };
};
