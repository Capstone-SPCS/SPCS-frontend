import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import EventOverview from '../../components/EventOverview';
import styles from './TechDashboard.module.css';
import { useGetEventsPreview } from '../../apiClient/useGetEventsPreview';
import { useNavigate } from 'react-router-dom';

const TechDashboard = () => {
  const navigate = useNavigate();
  const [satelliteFilter, setSatelliteFilter] = useState(''); // State for the satellite filter
  const [tcaFilter, setTcaFilter] = useState(''); // TCA filter state
  const [cdmCountFilter, setCdmCountFilter] = useState(''); // CDM count filter state

  const { fetchEvents, events } = useGetEventsPreview();
  const [filteredEvents, setFilteredEvents] = useState(events); // State for filtered events

  useEffect(() => {
    fetchEvents(); // Fetch events when the component mounts
  }, []);

  // Filter events when satellite filter input changes
  useEffect(() => {
    let filtered = events;

    // Filter by satellite designators
    if (satelliteFilter) {
      filtered = filtered.filter(
        (event) =>
          event.sat1_object_designator.includes(satelliteFilter) ||
          event.sat2_object_designator.includes(satelliteFilter)
      );
    }

    // Filter by TCA
    if (tcaFilter) {
      filtered = filtered.filter((event) => event.tca.includes(tcaFilter));
    }

    // Filter by CDM count
    if (cdmCountFilter) {
      filtered = filtered.filter(
        (event) =>
          event.cdms_aggregate.aggregate.count.toString() === cdmCountFilter
      );
    }

    setFilteredEvents(filtered);
  }, [satelliteFilter, tcaFilter, cdmCountFilter, events]);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`); // Navigate to the event details page
  };

  return (
    <div className={styles.container}>
      <Navbar userRole="Technical Operator" showLogout={true} />
      <main className={styles.main}>
        <h1 className={styles.title}>Dashboard</h1>

        <div className={styles.filterWrapper}>
          <input
            type="text"
            placeholder="Enter Satellite Designator ID"
            value={satelliteFilter}
            onChange={(e) => setSatelliteFilter(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Enter TCA (e.g., 2025-01-01)"
            value={tcaFilter}
            onChange={(e) => setTcaFilter(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="number"
            placeholder="Enter CDM Count"
            value={cdmCountFilter}
            onChange={(e) => setCdmCountFilter(e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.grid}>
          {filteredEvents?.map?.((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className={styles.cardWrapper}
            >
              <EventOverview
                id={event.id.toString()}
                sat1Designator={event.sat1_object_designator}
                sat2Designator={event.sat2_object_designator}
                tca={event.tca}
                numberOfCDMs={event.cdms_aggregate.aggregate.count}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TechDashboard;
