import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import EventOverview from '../../components/EventOverview'
import styles from './TechDashboard.module.css'
import { useGetEventsPreview } from '../../apiClient/useGetEventsPreview'
import { useNavigate } from 'react-router-dom'
import { useHasuraSubscription } from '../../apiClient/useWebsocket'

const TechDashboard = () => {
	const navigate = useNavigate()
	const [currentPage, setCurrentPage] = useState(0)

	const { fetchEvents, events, totalEventsCount } = useGetEventsPreview()
	

	const { isConnected, data, connect } = useHasuraSubscription('ws://104.131.168.48:8080/v1/graphql')
	const [unsubscribe, setUnsubscribe] = useState<()=>void>(); // Unsubscribe function


	useEffect(() => {
		console.log("Begin Connection")
		const unsub =  connect(['39265', "39089"])
		setUnsubscribe(() => unsub)
	}, [])

	useEffect(() => {
		console.log(data)
	}, [isConnected, data])
	

	useEffect(() => {
		fetchEvents(currentPage)
	}, [currentPage])

	// Calculate pagination
	const totalPages = Math.ceil((totalEventsCount || 1) / 12)

	const handleEventClick = (eventId: string) => {
		navigate(`/event/${eventId}`)
	}

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber)
		window.scrollTo(0, 0) // Scroll to top when page changes
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

				<div className={styles.pagination}>
					<button
						className={`${styles.pageButton} ${currentPage === 0 ? styles.disabled : ''}`}
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 0}>
						←
					</button>
					<span className={styles.pageInfo}>
						Page {currentPage + 1} of {totalPages}
					</span>
					<button
						className={`${styles.pageButton} ${
							currentPage === totalPages - 1 ? styles.disabled : ''
						}`}
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages - 1}>
						→
					</button>
				</div>
			</main>
		</div>
	)
}

export default TechDashboard
