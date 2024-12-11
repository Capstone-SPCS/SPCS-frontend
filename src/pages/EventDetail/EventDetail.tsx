import React from 'react'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { CesiumIntegration } from '../../components/CesiumIntegration'
import styles from './EventDetail.module.css'
import Probability from '../../components/Graphs/Probability'
import MissDistance from '../../components/Graphs/MissDistance'
import RSSErrorEvolution from '../../components/Graphs/RSSEvolution'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import useEventData from '../../apiClient/useEventData'
import { event } from '../../types/CDM'

const EventDetail = () => {
	const { eventId } = useParams()
	const navigate = useNavigate()

	const {fetchEvent, event} = useEventData()

	const handleGoRaw = () => {
		navigate(`/raw/${eventId}`)
	}

	useEffect(() => {
		if (eventId){
			fetchEvent(eventId)
			console.log("Event ID: ", eventId)
			console.log("Event: ", event)
		} else {
			console.error('No event id provided')
		}
	}, [])

	

	return (
		<div className={styles.container}>
			<Navbar userRole="Technical Operator" showLogout={true} />

			<main className={styles.main}>
				{/* Back Navigation */}
				<button onClick={() => window.history.back()} className={styles.backButton}>
					<ArrowLeft className={styles.backIcon} />
					Back to Event Dashboard
				</button>

				{/* Header */}
				<div className={styles.header}>
					<h1 className={styles.title}>Event {eventId}</h1>
					<button className={styles.rawDataButton} onClick={handleGoRaw}>
						Raw CDM Data
					</button>
				</div>

				{/* 3D Visualization Section */}
				<div className={styles.visualizationContainer}>
					<div className={styles.visualizationHeader}>
						<h2 className={styles.sectionTitle}>3D Visualization</h2>
					</div>
					<div className={styles.visualizationContent}>
						<CesiumIntegration />
					</div>
				</div>

				{/* CDM Specific Section */}
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>CDM Specific</h2>
					<div className={styles.graphGrid}>
						<div className={styles.graphCard}>
							<h3 className={styles.graphTitle}>Probability ISO lines</h3>
							<div className={styles.graphContent}>{/* Insert your graph component here */}</div>
						</div>
						<div className={styles.graphCard}>
							<h3 className={styles.graphTitle}>Miss distance ISO lines</h3>
							<div className={styles.graphContent}>{/* Insert your graph component here */}</div>
						</div>
						<div className={styles.graphCard}>
							<h3 className={styles.graphTitle}>Time to TCA</h3>
							<div className={styles.graphContent}>{/* Insert your graph component here */}</div>
						</div>
					</div>
				</section>
				{/* Event Specific Section */}

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Event Specific</h2>
					<div className={styles.graphGrid}>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<Probability id={event?.id!} sat1_object_designator={event?.sat1_object_designator!} sat2_object_designator={event?.sat2_object_designator!} cdms={event?.cdms!} ></Probability>
							</div>
						</div>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<MissDistance id={event?.id!} sat1_object_designator={event?.sat1_object_designator!} sat2_object_designator={event?.sat2_object_designator!} cdms={event?.cdms!}></MissDistance>
							</div>
						</div>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<RSSErrorEvolution id={event?.id!} sat1_object_designator={event?.sat1_object_designator!} sat2_object_designator={event?.sat2_object_designator!} cdms={event?.cdms!}></RSSErrorEvolution>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}

export default EventDetail
