import { useEffect, useState } from "react";
import useQuery from "./useQuery"; // Ensure this hook is implemented for handling GraphQL queries
import useMutation from "./useMutation"; // Ensure this hook is implemented for handling GraphQL mutations

const GET_SUBSCRIPTIONS_QUERY = `
    query GetUserSubscriptions($userID: Int!) {
        subscriptions(where: {user_id: {_eq: $userID}}) {
            satellite_id
        }
    }
`;

const UPDATE_SUBSCRIPTIONS_MUTATION = `
    mutation UpdateUserSubscription($userID: Int!, $newSatelliteIds: [String!]!) {
        update_subscriptions(
            where: { user_id: { _eq: $userID } },
            _set: { satellite_id: $newSatelliteIds }
        ) {
            affected_rows
            returning {
                satellite_id
            }
        }
    }
`;

interface Subscription {
    satellite_id: string;
}

export const useGetUserSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const { data, fetchData } = useQuery({
        query: GET_SUBSCRIPTIONS_QUERY,
    });

    const { mutate } = useMutation({
        mutation: UPDATE_SUBSCRIPTIONS_MUTATION,
    });

    useEffect(() => {
        if (data) {
            setSubscriptions(data.subscriptions);
        }
    }, [data]);

    const fetchSubscriptions = async (userID: number) => {
        try {
            await fetchData({ userID }); // Execute the query
        } catch (err: any) {
            setError(err); // Capture any error during the fetch
        } finally {
            setLoading(false); // Set loading to false once finished
        }
    };

    const updateSubscriptions = async (userID: number, newSatelliteIds: string[]) => {
        try {
            await mutate({ userID, newSatelliteIds });
            fetchSubscriptions(userID); // Refresh subscriptions after update
        } catch (err: any) {
            setError(err);
        }
    };

    return { subscriptions, loading, error, fetchSubscriptions, updateSubscriptions }; // Expose state and functions
};
