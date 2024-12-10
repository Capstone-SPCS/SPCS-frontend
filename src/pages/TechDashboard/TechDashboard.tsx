// TechDashboard.jsx
import React, { useEffect } from 'react'
import Navbar from '../../components/Navbar'
import EventOverview from '../../components/EventOverview'
import styles from './TechDashboard.module.css'
import { useGetEventsPreview } from '../../apiClient/useGetEventsPreview'
import { useNavigate } from 'react-router-dom'

const TechDashboard = () => {
	// Sample data - in a real app, this would come from an API
	// const events = [
	// 	{
	// 		id: 1,
	// 		eventId: 'EVT001',
	// 		objectType: 'Satellite',
	// 		poc: '12.5%',
	// 		tca: '2024-02-15',
	// 		numberOfCDMs: 3
	// 	}
	// 	// ... similar objects for Events 2-6
	// ]

	const navigate = useNavigate()

	const { fetchEvents, events } = useGetEventsPreview()

	useEffect(() => {
		fetchEvents()
	}, [])

	console.log(events)

	const handleEventClick = (eventId: string) => {
		// Handle navigation to event details
		navigate(`/event/${eventId}`)
	}

	return (
		<div className={styles.container}>
			<Navbar userRole="Technical Operator" showLogout={true} />
			<main className={styles.main}>
				<h1 className={styles.title}>Dashboard</h1>
				<div className={styles.grid}>
					{events?.map?.((event) => (
						<div
							key={event.id}
							onClick={() => handleEventClick(event.id)}
							className={styles.cardWrapper}>
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
	)
}

export default TechDashboard
