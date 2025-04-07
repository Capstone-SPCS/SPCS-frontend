interface CDM {
    id: number;
    created_at: string; // Timestamp with timezone
    event_id?: number; // Nullable foreign key
    rawData?: Record<string, unknown>; // JSONB column
    tca?: string; // Timestamp without timezone
    sat1_x?: number;
    sat1_y?: number;
    sat1_z?: number;
    sat2_x?: number;
    sat2_y?: number;
    sat2_z?: number;
    sat1_cn_n?: number;
    sat1_cn_r?: number;
    sat1_cn_t?: number;
    sat1_cr_r?: number;
    sat1_ct_r?: number;
    sat1_ct_t?: number;
    sat2_cn_n?: number;
    sat2_cn_r?: number;
    sat2_cn_t?: number;
    sat2_cr_r?: number;
    sat2_ct_r?: number;
    sat2_ct_t?: number;
    message_id?: string;
    originator?: string;
    sat1_x_dot?: number;
    sat1_y_dot?: number;
    sat1_z_dot?: number;
    sat2_x_dot?: number;
    sat2_y_dot?: number;
    sat2_z_dot?: number;
    sat1_object?: string;
    sat2_object?: string;
    sat1_cndot_n?: number;
    sat1_cndot_r?: number;
    sat1_cndot_t?: number;
    sat1_crdot_n?: number;
    sat1_crdot_r?: number;
    sat1_crdot_t?: number;
    sat1_ctdot_n?: number;
    sat1_ctdot_r?: number;
    sat1_ctdot_t?: number;
    sat2_cndot_n?: number;
    sat2_cndot_r?: number;
    sat2_cndot_t?: number;
    sat2_crdot_n?: number;
    sat2_crdot_r?: number;
    sat2_crdot_t?: number;
    sat2_ctdot_n?: number;
    sat2_ctdot_r?: number;
    sat2_ctdot_t?: number;
    creation_date?: string; // Timestamp without timezone
    miss_distance?: number;
    ccsds_cdm_vers?: string;
    sat1_cndot_ndot?: number;
    sat1_cndot_rdot?: number;
    sat1_cndot_tdot?: number;
    sat1_crdot_rdot?: number;
    sat1_ctdot_rdot?: number;
    sat1_ctdot_tdot?: number;
    sat2_cndot_ndot?: number;
    sat2_cndot_rdot?: number;
    sat2_cndot_tdot?: number;
    sat2_crdot_rdot?: number;
    sat2_ctdot_rdot?: number;
    sat2_ctdot_tdot?: number;
    sat1_object_name?: string;
    sat1_object_type?: string;
    sat2_object_name?: string;
    sat2_object_type?: string;
    sat1_catalog_name?: string;
    sat1_maneuverable?: string;
    sat2_catalog_name?: string;
    sat2_maneuverable?: string;
    sat2_ephemeris_name?: string;
    sat1_reference_frame?: string;
    sat2_reference_frame?: string;
    collision_probability?: number;
    sat1_covariance_method?: string;
    sat1_object_designator?: string;
    sat2_covariance_method?: string;
    sat2_object_designator?: string;
    sat1_operator_organization?: string;
    sat2_operator_organization?: string;
    sat1_international_designator?: string;
    sat2_international_designator?: string;
}
  

type event = {
    id: number;
    sat1_object_designator: string;
    sat2_object_designator: string;
    cdms: CDM[];
}

export { CDM, event };