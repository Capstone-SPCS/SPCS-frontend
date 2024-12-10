import { useEffect, useState } from 'react';
import useQuery from './useQuery'; // Make sure to adjust the import path as necessary.

const GET_EVENTS_PREVIEW_QUERY = `
  query GetEventsPreview {
    events {
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
    const [loading, setLoading] = useState(true);
    const [eventError, setEventError] = useState();

    const { data, error, fetchData } = useQuery({
        query: GET_EVENTS_PREVIEW_QUERY,
    });

    useEffect(() => {
        if (data) {
            setEvents(data.events)
        }
    }, [data])


    const fetchEvents = async () => {
        try {
            await fetchData(); // Execute the query
            if (error) {
                throw new Error(error as unknown as string);
            }
        } catch (err: any) {
            setEventError(err); // Capture any error during the fetch
        } finally {
            setLoading(false); // Set loading to false once finished
        }
    };

    return { events, loading, eventError, fetchEvents }; // Expose the state and data for use in components
};