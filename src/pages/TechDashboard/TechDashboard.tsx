import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import EventOverview from '../../components/EventOverview';
import styles from './TechDashboard.module.css';
import { useGetEventsPreview } from '../../apiClient/useGetEventsPreview';
import { useNavigate } from 'react-router-dom';

const TechDashboard = () => {
  const navigate = useNavigate();
  const [satelliteFilter, setSatelliteFilter] = useState(''); // State for the satellite filter
  const { fetchEvents, events } = useGetEventsPreview();
  const [filteredEvents, setFilteredEvents] = useState(events); // State for filtered events

  useEffect(() => {
    fetchEvents(); // Fetch events when the component mounts
  }, [fetchEvents]);

  // Filter events when satellite filter input changes
  useEffect(() => {
    if (satelliteFilter === '') {
      setFilteredEvents(events); // Show all events if filter is empty
    } else {
      setFilteredEvents(
        events.filter(
          (event) =>
            event.sat1_object_designator.includes(satelliteFilter) ||
            event.sat2_object_designator.includes(satelliteFilter)
        )
      );
    }
  }, [satelliteFilter, events]);

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
            onChange={(e) => setSatelliteFilter(e.target.value)} // Update filter state
            className={styles.filterInput}
          />
          <button className={styles.filterButton}>
            Filter
          </button>
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
