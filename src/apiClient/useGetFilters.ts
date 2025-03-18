import { useEffect, useState } from "react";
import useQuery from "./useQuery"; // Ensure this hook is implemented for handling GraphQL queries
import useMutation from "./useMutation"; // Ensure this hook is implemented for handling GraphQL mutations

const GET_SUBSCRIPTIONS_QUERY = `
    query GetUserSubscriptions($userID: String!) {
        subscriptions(where: {user_id: {_eq: $userID}}) {
            satellite_id
        }
    }
`;

const UPDATE_SUBSCRIPTIONS_MUTATION = `
    mutation UpdateUserSubscription($userID: String!, $newSatelliteIds: [String!]!) {
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

const ADD_SUBSCRIPTION_MUTATION = `
    mutation UpdateUserSubscription($userID: String!, $newSatelliteId: bigint!) {
        insert_subscriptions(objects: [{user_id: $userID, satellite_id: $newSatelliteId}]) {
            affected_rows
            returning {
                id
            }
        }
    }
`;

const DELETE_SUBSCRIPTION_MUTATION = `
    mutation DeleteUserSubscription($userID: String!, $satelliteId: bigint!) {
        delete_subscriptions(
            where: { 
                _and: [
                    { user_id: { _eq: $userID } },
                    { satellite_id: { _eq: $satelliteId } }
                ]
            }
        ) {
            affected_rows
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

    const updateMutation = useMutation({
        mutation: UPDATE_SUBSCRIPTIONS_MUTATION,
    });

    const insertMutation = useMutation({
        mutation: ADD_SUBSCRIPTION_MUTATION
    });

    const deleteMutation = useMutation({
        mutation: DELETE_SUBSCRIPTION_MUTATION
    });

    useEffect(() => {
        if (data) {
            setSubscriptions(data.subscriptions);
        }
    }, [data]);

    const fetchSubscriptions = async (userID: string) => {
        try {
            await fetchData({ userID }); // Execute the query
        } catch (err: any) {
            setError(err); // Capture any error during the fetch
        } finally {
            setLoading(false); // Set loading to false once finished
        }
    };

    const updateSubscriptions = async (userID: string, newSatelliteIds: number[]) => {
        try {
            await updateMutation.mutate({ userID, newSatelliteIds });
            fetchSubscriptions(userID); // Refresh subscriptions after update
        } catch (err: any) {
            setError(err);
        }
    };

    const addSubscription = async (userID: string, newSatelliteId: number) => {
        try {
            await insertMutation.mutate({ userID, newSatelliteId });
            fetchSubscriptions(userID); // Refresh subscriptions after update
        } catch (err: any) {
            setError(err);
        }
    };

    const deleteSubscription = async (userID: string, satelliteId: number) => {
        try {
            await deleteMutation.mutate({ userID, satelliteId });
            fetchSubscriptions(userID); // Refresh subscriptions after deletion
        } catch (err: any) {
            setError(err);
        }
    };

    return {
        subscriptions,
        loading,
        error,
        fetchSubscriptions,
        updateSubscriptions,
        addSubscription,
        deleteSubscription
    }; // Expose state and functions
};