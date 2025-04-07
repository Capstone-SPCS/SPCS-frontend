import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface UseQueryProps {
    query: string;
}

const EXPRESS_URL = process.env.REACT_APP_EXPRESS_URL || ''

const useQuery = ({ query }: UseQueryProps) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const token = useSelector((state: RootState) => state.login.token);

    const fetchData = async (variables?: Record<string, any>, bToken?: string) => {
        // console.log("fetching token with btoken", bToken)
        try {
            const response = await fetch(EXPRESS_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || bToken}`,
                    'Content-Type': 'application/json',
                    "x-hasura-admin-secret": "your_hasura_admin_secret"
                },
                body: JSON.stringify({
                    query,
                    variables,
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors.map((err: { message: any; }) => err.message).join(', '));
            }

            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { data, error, loading, fetchData };
};

export default useQuery;