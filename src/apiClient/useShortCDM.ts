import { useEffect, useState } from 'react';
import useQuery from './useQuery';

// Simplified CDM interface matching the UI cards
interface SimplifiedCDM {
    id: number;
    message_id: string;
    event_id: string;
    object_type: string;
    poc: string;          // Probability of Collision
    tca: string;          // Time of Closest Approach
    source: string;
    operator: string;
}

const GET_SHORT_CDMS_QUERY = `
query GetShortCDMs {
  cdms(limit: 9, order_by: {created_at: desc}) {
    id
    created_at
    message_id
    event_id
    collision_probability
    tca
    originator
    sat1_operator_organization
  }
}

`;

export const useShortCDM = () => {
    const [cdms, setCDMs] = useState<SimplifiedCDM[]>([]);
    const [loading, setLoading] = useState(true);
    const [cdmsError, setCDMsError] = useState<Error | undefined>();

    const { data, error, fetchData } = useQuery({
        query: GET_SHORT_CDMS_QUERY,
    });

    useEffect(() => {
        if (data) {
            // Transform the raw data to match the SimplifiedCDM interface
            const transformedCDMs = data?.cdms?.map((cdm: any) => ({
                id: cdm.id,
                message_id: cdm.message_id,
                event_id: cdm.event_id,
                object_type: cdm.object_type,
                poc: (cdm.collision_probability.toExponential(1)), // Convert to percentage
                tca: cdm.tca,
                source: cdm.originator,
                operator: cdm.sat1_operator_organization
            }));
            setCDMs(transformedCDMs);
        }
    }, [data]);

    const fetchShortCDMs = async () => {
        try {
            setLoading(true);
            await fetchData();
            if (error) {
                throw new Error(error as unknown as string);
            }
        } catch (err) {
            setCDMsError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch CDMs when the hook is mounted
    useEffect(() => {
        fetchShortCDMs();
    }, []);

    return { cdms, loading, cdmsError, fetchShortCDMs };
};