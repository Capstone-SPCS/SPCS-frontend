import { useEffect, useRef, useCallback, useState } from "react";

// Define types for message and error handlers
type MessageHandler = (message: any) => void;
type ErrorHandler = (error: Event) => void;

interface UseWebSocketReturn {
  sendMessage: (message: any) => void;
  isConnected: boolean;
}

export const useWebSocket = (
  url: string,
  onMessage?: MessageHandler,
  onError?: ErrorHandler
): UseWebSocketReturn => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Function to send a message through the WebSocket
  const sendMessage = useCallback(
    (message: any) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(message));
      } else {
        console.error("WebSocket is not connected.");
      }
    },
    []
  );

  useEffect(() => {
    const connect = () => {
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      socketRef.current.onmessage = (event: MessageEvent) => {
        if (onMessage) {
          onMessage(JSON.parse(event.data));
        }
      };

      socketRef.current.onerror = (event: Event) => {
        console.error("WebSocket error:", event);
        if (onError) {
          onError(event);
        }
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting...");
        setIsConnected(false);

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          connect();
        }, 5000);
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url, onMessage, onError]);

  return { sendMessage, isConnected };
};
