import { useEffect, useState } from 'react';
import useQuery from './useQuery';

const GET_OPERATOR_BY_UID_QUERY = `
  query GetOperatorByUid($uid: String!) {
    operators(where: { uid: { _eq: $uid } }) {
      id
      name
      uid
      role
      threshold
    }
  }
`;

interface Operator {
    id: string;
    name: string;
    uid: string;
    role: string;
    threshold: number
}

export const useGetOperator = () => {
    const [operator, setOperator] = useState<Operator | null>(null);
    const [loading, setLoading] = useState(true);
    const [operatorError, setOperatorError] = useState();

    const { data, error, fetchData } = useQuery({
        query: GET_OPERATOR_BY_UID_QUERY,
    });

    useEffect(() => {
        if (data?.operators && data.operators.length > 0) {
            setOperator(data.operators[0]);
        }
    }, [data]);

    const fetchOperator = async (uid: string, token: string) => {
        try {
            await fetchData({ uid }, token);
            if (error) {
                throw new Error(error as unknown as string);
            }
        } catch (err: any) {
            setOperatorError(err);
        } finally {
            setLoading(false);
        }
    };

    return { operator, loading, operatorError, fetchOperator };
};