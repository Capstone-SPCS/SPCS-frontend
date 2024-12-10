import { useEffect, useState } from 'react';
import useQuery from './useQuery'; // Make sure to adjust the import path as necessary.

const GET_EVENTS_PREVIEW_QUERY = `
  query GetEventsPreview {
    events {
      id
      eventId
      objectType
      poc
      tca
      numberOfCDMs
    }
  }
`;

export const useGetEventsPreview = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventError, setEventError] = useState();

    const { data, error, fetchData } = useQuery({
        query: GET_EVENTS_PREVIEW_QUERY,
    });

    const fetchEvents = async (id: string) => {
        try {
            await fetchData({
                id
            }); // Execute the query
            if (error) {
                throw new Error(error as unknown as string);
            }
            setEvents(data); // Set the events from the response
        } catch (err: any) {
            setEventError(err); // Capture any error during the fetch
        } finally {
            setLoading(false); // Set loading to false once finished
        }
    };

    return { events, loading, eventError, fetchEvents }; // Expose the state and data for use in components
};