import { useEffect, useState } from 'react';
import useQuery from './useQuery';
import { event } from '../types/CDM';

const GET_EVENTS_QUERY = `  
query GetEventData($eventId: bigint) {
  events(where: {id: {_eq: $eventId}}) {
    id
    sat1_object_designator
    sat2_object_designator
    cdms(where: {sat1_cn_n: {_is_null: false}}) {
      creation_date
      collision_probability  
      miss_distance 
      sat1_cn_n
      sat1_cr_r
      sat1_ct_t
      sat1_x
      sat1_y
      sat1_z
      sat2_cn_n
      sat2_cr_r
      sat2_ct_t
      sat2_x
      sat2_y
      sat2_z
    }
  }
} 
`;

const useEventData = () => {
  const [event, setEvent] = useState<event>();
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState();

  const { data, error, fetchData } = useQuery({
    query: GET_EVENTS_QUERY
  });

  useEffect(() => {
    console.log("useEffect");
    if (data) {
      setEvent(data.events[0]);
    }
  }, [data])

  const fetchEvent = async (eventId: string) => {
    console.log("fetchEvent");
    try {
      await fetchData({
        eventId
      }); // Execute the query
      if (error) {
        throw new Error(error as unknown as string);
      }
    } catch (err: any) {
      console.log("fetchEvent catch");
      setEventError(err); // Capture any error during the fetch
    } finally {
      console.log("fetchEvent finally");
      setLoading(false); // Set loading to false once finished
    }
  };

  return { event, loading, eventError, fetchEvent }; // Expose the state and data for use in components
};

export default useEventData;