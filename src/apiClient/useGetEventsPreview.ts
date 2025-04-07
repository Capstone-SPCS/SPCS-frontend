import { useEffect, useState } from 'react';
import useQuery from './useQuery'; // Make sure to adjust the import path as necessary.


const PAGE_LIMIT = 9;

const GET_ALL_EVENTS_PREVIEW_QUERY = `
query GetAllEventsPreview($limit: Int!, $offset: Int!) {
  events(
    limit: $limit, 
    offset: $offset,
    order_by: {created_at: desc}
  ) {
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
`

const GET_EVENTS_PREVIEW_QUERY = `
query GetFilteredEventsPreview($limit: Int!, $offset: Int!, $satelliteId: String!) {
  events(
    limit: $limit, 
    offset: $offset,
    order_by: {created_at: desc},
    where: {
      _or: [
        {sat1_object_designator: {_eq: $satelliteId}},
        {sat2_object_designator: {_eq: $satelliteId}}
      ]
    }
  ) {
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
  events_aggregate(
    where: {
      _or: [
        {sat1_object_designator: {_eq: $satelliteId}},
        {sat2_object_designator: {_eq: $satelliteId}}
      ]
    }
  ) {
    aggregate {
      count
    }
  }
}
`;
export interface Event {
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
  const [isFiltered, setIsFiltered] = useState(false);

  const filtered = useQuery({
    query: GET_EVENTS_PREVIEW_QUERY,
  });

  const all = useQuery({
    query: GET_ALL_EVENTS_PREVIEW_QUERY
  })

  useEffect(() => {
    const data = isFiltered ? filtered.data : all.data
    if (data) {
      setEvents(data.events)
      setTotalEventsCount(data?.events_aggregate?.aggregate?.count)

    }
  }, [all.data, filtered.data])


  const fetchEvents = async (page: number, satelliteId: string | null) => {
    try {
      setIsFiltered(!!satelliteId)
      if (satelliteId) {
        await filtered.fetchData({
          limit: PAGE_LIMIT,
          offset: page * PAGE_LIMIT,
          satelliteId: satelliteId || ""
        }); // Execute the query
        if (filtered.error) {
          throw new Error(filtered.error as unknown as string);
        }
      } else {
        await all.fetchData({
          limit: PAGE_LIMIT,
          offset: page * PAGE_LIMIT,
        }); // Execute the query
        if (all.error) {
          throw new Error(all.error as unknown as string);
        }
      }


    } catch (err: any) {
      setEventError(err); // Capture any error during the fetch
    } finally {
      setLoading(false); // Set loading to false once finished
    }
  };

  return { totalEventsCount, events, loading, eventError, fetchEvents }; // Expose the state and data for use in components
};