import { useEffect, useState } from 'react';
import useQuery from './useQuery';

const GET_EVENTS_QUERY = `  
query GetEventData($id: ID!) {  
  eventData(id: $id) {  
    collision_probability  
    miss_distance  
    sat1_cn_n  
    sat1_cr_r  
    sat1_ct_t  
    sat2_cn_n  
    sat2_cr_r  
    sat2_ct_t  
  }  
}  
`;

const useEventData = () => {
  const [event, setEvent] = useState();
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState();

  const { data, error, fetchData } = useQuery({
    query: GET_EVENTS_QUERY
  });

  useEffect(() => {
    if (data) {
      setEvent(data.events)
    }
  }, [data])

  const fetchEvent = async (eventId: string) => {
    try {
      await fetchData({
        eventId
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

  return { event, loading, eventError, fetchEvent }; // Expose the state and data for use in components
};

export default useEventData;