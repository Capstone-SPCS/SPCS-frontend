import useQuery from './useQuery';  

const useCesiumData = (eventId: string, cdMid: string, time: string) => {  
    const query = `  
      query GetCesiumData($eventId: ID!, $cdMid: ID!, $time: String!) {  
        cesiumData(eventId: $eventId, cdMid: $cdMid, time: $time) {  
          longitude  
          latitude  
          altitude  
          sat1ID  
          sat2ID  
        }  
      }  
    `;  

    return useQuery({  
        query,  
        variables: { eventId, cdMid, time },  
    });  
};  

export default useCesiumData;