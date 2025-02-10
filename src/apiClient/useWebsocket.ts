import { useEffect, useState, useRef } from "react";
import { createClient, Client } from "graphql-ws";

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
      where: {
        _or: [
          { sat1_object_designator: { _in: $satelliteIds } },
          { sat2_object_designator: { _in: $satelliteIds } }
        ]
      }, 
      order_by: { created_at: desc }
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
  const clientRef = useRef<Client | null>(null);

  const connect = (satelliteIds: string[]) => {
    if (satelliteIds.length === 0) {
      console.warn("No satellite IDs available, delaying WebSocket connection.");
      return;
    }
    
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
      { query: SUBSCRIPTION_QUERY, variables: { satelliteIds } },
      {
        next: ({ data }: { data: SubscriptionResponse }) => {
          console.log("New subscription data:", data);
          setData(data?.events?.[0] || null);
        },
        error: (err) => {
          console.error("Subscription error:", err);
          setIsConnected(false);
        },
        complete: () => console.log("Subscription completed."),
      }
    );

    return unsubscribe;
  };

  return { isConnected, data, connect };
};
