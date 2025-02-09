import { useEffect, useState, useRef } from "react";
import { createClient, Client } from "graphql-ws";

// Placeholder query: Replace with actual Hasura subscription
const SUBSCRIPTION_QUERY = `
  subscription MyQuery {
        operators {
        id
        name
        uid
        role
        threshold
        }
    }
`;

export const useHasuraSubscription = (url: string, query = SUBSCRIPTION_QUERY) => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Create GraphQL WebSocket client
    const client = createClient({
      url,
      connectionParams: {
        headers: {
          "x-hasura-admin-secret": "your_hasura_admin_secret", // Replace with your actual Hasura admin secret or use authentication
        },
      },
    });

    clientRef.current = client;
    setIsConnected(true);

    const unsubscribe = client.subscribe(
      { query },
      {
        next: ({ data }) => {
          console.log("New subscription data:", data);
          setData((prev) => [...prev, data]);
        },
        error: (err) => {
          console.error("Subscription error:", err);
          setIsConnected(false);
        },
        complete: () => console.log("Subscription completed."),
      }
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [url, query]);

  return { isConnected, data };
};