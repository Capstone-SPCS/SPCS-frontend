import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import EventOverview from '../../components/EventOverview'
import styles from './TechDashboard.module.css'
import { Event, useGetEventsPreview } from '../../apiClient/useGetEventsPreview'
import { useNavigate } from 'react-router-dom'
import { useHasuraSubscription } from '../../apiClient/useWebsocket'
import Filterbar from '../../components/Filterbar'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

const TechDashboard = () => {
	const navigate = useNavigate()
	const [currentPage, setCurrentPage] = useState(0)
	const [firstResponse, setFirstResponse] = useState(true)
	const satelliteId = useSelector((state: RootState) => state.filters.satelliteId)
	const subscriptions = useSelector((state: RootState) => state.filters.subscriptions)
	const { fetchEvents, events, totalEventsCount } = useGetEventsPreview()

	const [displayedEvents, setDisplayedEvents] = useState<Event[]>([])

	const { isConnected, data, connect } = useHasuraSubscription(
		'ws://104.131.168.48:8080/v1/graphql'
	)
	const [unsubscribe, setUnsubscribe] = useState<() => void>() // Unsubscribe function

	useEffect(() => {
		if (unsubscribe) unsubscribe()
		const unsub = connect(subscriptions)
		setUnsubscribe(() => unsub)
	}, [subscriptions])

	useEffect(() => {
		if (firstResponse) {
			if (data) {
				console.log(data)
				setFirstResponse(false)
			}
		} else {
			if (data) {
				setDisplayedEvents((prevEvents) => {
					// Add the new event to the beginning of the array
					const updatedEvents = [data as Event, ...prevEvents]

					// If we have more than 9 events, remove the last one
					if (updatedEvents.length > 9) {
						return updatedEvents.slice(0, 9)
					}

					return updatedEvents
				})
			}
		}
	}, [isConnected, data])

	useEffect(() => {
		fetchEvents(currentPage, satelliteId)
	}, [currentPage, satelliteId])

	useEffect(() => {
		if (events) {
			setDisplayedEvents(events)
		}
	}, [events])

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
			<Filterbar>
				<main className={styles.main}>
					<h1 className={styles.title}>Dashboard</h1>
					<div className={styles.grid}>
						{displayedEvents?.map?.((event) => (
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
			</Filterbar>
		</div>
	)
}

export default TechDashboard
