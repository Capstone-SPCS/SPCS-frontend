import { useState } from 'react';

interface UseQueryProps {
    query: string;
}

const useQuery = ({ query }: UseQueryProps) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (variables?: Record<string, any>) => {
        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

            setData(result.data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();

    return { data, error, loading, fetchData };
};

export default useQuery;