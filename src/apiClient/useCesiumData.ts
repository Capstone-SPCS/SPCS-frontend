import useQuery from './useQuery';

const useCesiumData = (eventId: string, cdMid: string, time: string) => {
  const query = `  
      query GetCesiumData($eventId: ID!, $cdMid: ID!, $time: String!) {  
        cesiumData(eventId: $eventId, cdMid: $cdMid, time: $time) {  
          sat1_x
          sat1_y
          sat1_z
          sat1_object_designator
          sat2_x
          sat2_y
          sat2_z
          sat2_object_designator
        }  
      }  
    `;

  return useQuery({
    query,
  });
};

export default useCesiumData;