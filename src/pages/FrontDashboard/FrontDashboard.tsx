// FrontDashboard.jsx
import React from 'react'
import Navbar from '../../components/Navbar'
import CDMOverview from '../../components/CDMOverview'
import styles from './FrontDashboard.module.css'

const FrontDashboard = () => {
	// Sample data - in a real app, this would come from an API
	const cdmData = [
		{
			id: 1,
			messageId: 'MSG001',
			eventId: 'EVT001',
			objectType: 'Satellite',
			poc: '12.5%',
			tca: '2024-02-15',
			source: 'NASA',
			operator: 'SpaceX',
			hasAlert: true
		}
		// ... similar objects for CDM2-6
	]

	const handleCDMClick = (eventId: number) => {
		// Handle navigation to event details
		console.log(`Navigating to event ${eventId}`)
	}

	return (
		<div className={styles.container}>
			<Navbar />
			<main className={styles.main}>
				<h1 className={styles.title}>CDM Dashboard</h1>
				<div className={styles.grid}>
					{[1, 2, 3, 4, 5, 6].map((id) => (
						<div key={id} onClick={() => handleCDMClick(id)} className={styles.cardWrapper}>
							<CDMOverview
								key={id}
								id={id.toString()}
								messageId={`MSG00${id}`}
								eventId={`EVT00${id}`}
								objectType="Satellite"
								poc="12.5%"
								tca="2024-02-15"
								source="NASA"
								operator="SpaceX"
								hasAlert={id === 1}
							/>
						</div>
					))}
				</div>
			</main>
		</div>
	)
}

export default FrontDashboard
