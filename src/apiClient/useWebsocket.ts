import { useState, useRef, useEffect } from "react";

interface Event {
  created_at: string;
  id: string;
  sat1_object_designator: string;
  sat2_object_designator: string;
  tca: string;
  cdms_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

interface SubscriptionResponse {
  events: Event[];
}


const SUBSCRIPTION_QUERY = `
  subscription GetMostRecentEvent($satelliteIds: [String!]!) {
    events(
      limit: 1, 
      order_by: {created_at: desc},
      where: {
        _or: [
          { sat1_object_designator: { _in: $satelliteIds } },
          { sat2_object_designator: { _in: $satelliteIds } }
        ]
      }
    ) {
        created_at
        id
        sat1_object_designator
        sat2_object_designator
        tca
        cdms_aggregate {
            aggregate {
                count
            }
        }
    }
  }
`;

export const useHasuraSubscription = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<Event | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up function to handle disconnection
  const disconnect = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  };

  // Connect function with direct WebSocket implementation
  const connect = (satelliteIds: string[]): (() => void) => {
    console.log("Connecting to Hasura subscription");

    // First, clean up any existing connection
    disconnect();

    if (satelliteIds.length === 0) {
      console.warn("No satellite IDs available, cannot establish WebSocket connection.");
      return () => { };
    }

    try {
      // Create WebSocket connection directly with the GraphQL WS protocol
      const ws = new WebSocket(url, ['graphql-ws']);
      wsRef.current = ws;

      // Connection handling
      ws.onopen = () => {
        console.log("WebSocket connection established");
        setIsConnected(true);

        // Send the subscription request only after connection_ack
        const subscriptionMessage = {
          type: "start",
          id: "subscription-1",
          payload: {
            query: SUBSCRIPTION_QUERY,
            variables: { satelliteIds }
          }
        };

        ws.send(JSON.stringify(subscriptionMessage));
      };

      // Message handling
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          // Handle different message types
          if (response.type === "data" && response.payload.data) {
            const subscriptionData = response.payload.data as SubscriptionResponse;
            console.log("New subscription data received:", subscriptionData);

            if (subscriptionData.events && subscriptionData.events.length > 0) {
              setData(subscriptionData.events[0]);
            }
          }

          // Handle connection_ack
          if (response.type === "connection_ack") {
            console.log("WebSocket connection acknowledged by server");
            setIsConnected(true);

            // Now send the subscription request after connection is acknowledged
            const subscriptionMessage = {
              type: "start",
              id: "subscription-1",
              payload: {
                query: SUBSCRIPTION_QUERY,
                variables: { satelliteIds }
              }
            };

            ws.send(JSON.stringify(subscriptionMessage));
          }

          // Handle errors
          if (response.type === "error") {
            console.error("Subscription error:", response.payload);
          }

          // Handle complete
          if (response.type === "complete") {
            console.log("Subscription completed");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      // Error handling
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      // Close handling
      ws.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}: ${event.reason}`);
        setIsConnected(false);

        // Implement reconnection logic
        if (event.code !== 1000) { // Normal closure
          console.log("Attempting to reconnect in 5 seconds...");
          timeoutRef.current = setTimeout(() => {
            connect(satelliteIds);
          }, 5000);
        }
      };

      // Initialize connection with a proper connection_init message
      ws.addEventListener("open", () => {
        console.log("Sending connection initialization");
        ws.send(JSON.stringify({
          type: "connection_init",
          payload: {
            headers: {
              "x-hasura-admin-secret": "your_hasura_admin_secret" // Replace with actual secret
            }
          }
        }));
      });

      // Return disconnect function
      return disconnect;
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnected(false);
      return () => { };
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return { isConnected, data, connect, disconnect };
};