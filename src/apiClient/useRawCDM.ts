import { useEffect, useState } from 'react';
import useQuery from './useQuery'; // Make sure to adjust the import path as necessary.
import { CDM } from '../types/CDM';

const GET_RAW_CDMDS_QUERY = `
  query GetRawCDMs($eventId: bigint) {
  cdms(where: {event_id: {_eq: $eventId}}) {
    id
    event_id
    ccsds_cdm_vers
    collision_probability
    created_at
    creation_date
    message_id
    miss_distance
    originator
    sat1_catalog_name
    sat1_cn_n
    sat1_cn_r
    sat1_cn_t
    sat1_cndot_n
    sat1_cndot_ndot
    sat1_cndot_r
    sat1_cndot_rdot
    tca
    sat2_z_dot
    sat2_z
    sat2_y_dot
    sat2_y
    sat2_x_dot
    sat2_x
    sat2_reference_frame
    sat2_operator_organization
    sat2_object_type
    sat2_object_name
    sat2_object_designator
    sat2_object
    sat2_maneuverable
    sat2_international_designator
    sat2_ephemeris_name
    sat2_ctdot_tdot
    sat2_ctdot_t
    sat2_ctdot_rdot
    sat2_ctdot_r
    sat2_ctdot_n
    sat2_ct_t
    sat2_ct_r
    sat2_crdot_t
    sat2_crdot_rdot
    sat2_crdot_r
    sat2_crdot_n
    sat2_cr_r
    sat2_covariance_method
    sat2_cndot_tdot
    sat2_cndot_t
    sat2_cndot_rdot
    sat2_cndot_r
    sat2_cndot_ndot
    sat2_cndot_n
    sat2_cn_t
    sat2_cn_r
    sat2_cn_n
    sat2_catalog_name
    sat1_z_dot
    sat1_z
    sat1_y_dot
    sat1_y
    sat1_x_dot
    sat1_reference_frame
    sat1_x
    sat1_operator_organization
    sat1_object_type
    sat1_object_name
    sat1_object_designator
    sat1_object
    sat1_maneuverable
    sat1_international_designator
    sat1_ctdot_tdot
    sat1_ctdot_t
    sat1_ctdot_rdot
    sat1_ctdot_r
    sat1_ctdot_n
    sat1_ct_t
    sat1_ct_r
    sat1_crdot_t
    sat1_crdot_rdot
    sat1_crdot_r
    sat1_crdot_n
    sat1_cr_r
    sat1_cndot_t
    sat1_cndot_tdot
    sat1_covariance_method
  }
}
`;


export const useRawCDM = () => {
    const [cdms, setCDMs] = useState<CDM[]>([]);
    const [loading, setLoading] = useState(true);
    const [cdmsError, setCDMsError] = useState();

    const { data, error, fetchData } = useQuery({
        query: GET_RAW_CDMDS_QUERY,
    });

    useEffect(() => {
        if (data) {
            setCDMs(data.cdms)
        }
    }, [data])


    const fetchCDMs = async (eventId: string) => {
        try {
            await fetchData({ eventId }); // Execute the query
            if (error) {
                throw new Error(error as unknown as string);
            }
        } catch (err: any) {
            setCDMsError(err); // Capture any error during the fetch
        } finally {
            setLoading(false); // Set loading to false once finished
        }
    };

    return { cdms, loading, cdmsError, fetchCDMs }; // Expose the state and data for use in components
};