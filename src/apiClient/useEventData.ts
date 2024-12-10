import useQuery from './useQuery';

const useEventData = (id: string) => {
  const query = `  
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

  return useQuery({
    query
  });
};

export default useEventData;