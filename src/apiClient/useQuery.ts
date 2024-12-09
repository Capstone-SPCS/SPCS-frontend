import { useState, useEffect } from 'react';

interface UseQueryProps {
    query: string;
    variables: Record<string, any>;
}

const useQuery = ({ query, variables }: UseQueryProps) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
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
    }, [query, variables]);

    return { data, error, loading };
};

export default useQuery;