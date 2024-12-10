// TechDashboard.jsx
import React, { useEffect } from 'react'
import Navbar from '../../components/Navbar'
import EventOverview from '../../components/EventOverview'
import styles from './TechDashboard.module.css'
import { useGetEventsPreview } from '../../apiClient/useGetEventsPreview'

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

	const { fetchEvents, events } = useGetEventsPreview()

	useEffect(() => {
		fetchEvents('3')
	}, [])

	console.log(events)

	const handleEventClick = (eventId: number) => {
		// Handle navigation to event details
		console.log(`Navigating to event ${eventId}`)
	}

	return (
		<div className={styles.container}>
			<Navbar userRole="Technical Operator" showLogout={true} />
			<main className={styles.main}>
				<h1 className={styles.title}>Dashboard</h1>
				<div className={styles.grid}>
					{[1, 2, 3, 4, 5, 6].map((id) => (
						<div key={id} onClick={() => handleEventClick(id)} className={styles.cardWrapper}>
							<EventOverview
								id={id.toString()}
								eventId={`EVT00${id}`}
								objectType="Satellite"
								poc="12.5%"
								tca="2024-02-15"
								numberOfCDMs={3}
							/>
						</div>
					))}
				</div>
			</main>
		</div>
	)
}

export default TechDashboard
