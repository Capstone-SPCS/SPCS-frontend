import { useEffect, useState } from 'react';
import useQuery from './useQuery'; // Make sure to adjust the import path as necessary.


const PAGE_LIMIT = 9;
const GET_EVENTS_PREVIEW_QUERY = `
  query GetEventsPreview($limit: Int!, $offset: Int!) {
    events(limit: $limit, offset: $offset) {
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
    events_aggregate {
        aggregate {
            count
        }
    }
}
`;

interface Event {
    created_at: string; // ISO 8601 date string
    id: string; // Unique identifier for the event
    sat1_object_designator: string; // Satellite 1 designator
    sat2_object_designator: string; // Satellite 2 designator
    tca: string; // Time of closest approach as ISO 8601 date string
    cdms_aggregate: {
        aggregate: {
            count: number; // Number of cdms
        };
    };
}

export const useGetEventsPreview = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [totalEventsCount, setTotalEventsCount] = useState<number | null>(0);
    const [loading, setLoading] = useState(true);
    const [eventError, setEventError] = useState();

    const { data, error, fetchData } = useQuery({
        query: GET_EVENTS_PREVIEW_QUERY,
    });

    useEffect(() => {
        if (data) {
            setEvents(data.events)
            setTotalEventsCount(data?.events_aggregate?.aggregate?.count)

        }
    }, [data])


    const fetchEvents = async (page: number) => {
        try {
            await fetchData({
                limit: PAGE_LIMIT,
                offset: page * PAGE_LIMIT
            }); // Execute the query
            if (error) {
                throw new Error(error as unknown as string);
            }
        } catch (err: any) {
            setEventError(err); // Capture any error during the fetch
        } finally {
            setLoading(false); // Set loading to false once finished
        }
    };

    return { totalEventsCount, events, loading, eventError, fetchEvents }; // Expose the state and data for use in components
};