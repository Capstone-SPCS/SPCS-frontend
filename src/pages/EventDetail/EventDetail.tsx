import React from 'react'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { CesiumIntegration } from '../../components/CesiumIntegration'
import styles from './EventDetail.module.css'
import Probability from '../../components/Graphs/Probability'
import MissDistance from '../../components/Graphs/MissDistance'
import RSSErrorEvolution from '../../components/Graphs/RSSEvolution'
import IsolineGraph from '../../components/Graphs/IsoLine'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useEventData from '../../apiClient/useEventData'
import { event } from '../../types/CDM'

const EventDetail = () => {
	const { eventId } = useParams()
	const navigate = useNavigate()
	const { fetchEvent, event, loading } = useEventData()

	const handleGoRaw = () => {
		navigate(`/raw/${eventId}`)
	}

	useEffect(() => {
		if (eventId) {
			fetchEvent(eventId)
		} else {
			console.error('No event id provided')
		}
	}, [eventId])

	// Return a loading state while the event data is being fetched
	if (loading) {
		return (
			<div className={styles.container}>
				<Navbar userRole="Technical Operator" showLogout={true} />
				<main className={styles.main}>
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
						<p className="ml-3">Loading event data...</p>
					</div>
				</main>
			</div>
		)
	}

	// Check if event data is available
	if (!event || !event.cdms) {
		return (
			<div className={styles.container}>
				<Navbar userRole="Technical Operator" showLogout={true} />
				<main className={styles.main}>
					<button onClick={() => window.history.back()} className={styles.backButton}>
						<ArrowLeft className={styles.backIcon} />
						Back to Events Dashboard
					</button>
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-6">
						<p>No event data available. The event may not exist or there was an error loading it.</p>
					</div>
				</main>
			</div>
		)
	}

	// Now we can safely access event data
	const latestCdm = event.cdms.length > 0 
		? event.cdms.sort((a, b) => 
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		)[0] 
		: null;

	if (!latestCdm) {
		return (
			<div className={styles.container}>
				<Navbar userRole="Technical Operator" showLogout={true} />
				<main className={styles.main}>
					<button onClick={() => window.history.back()} className={styles.backButton}>
						<ArrowLeft className={styles.backIcon} />
						Back to Events Dashboard
					</button>
					<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-6">
						<p>No CDM data available for this event.</p>
					</div>
				</main>
			</div>
		)
	}

	// Map CDM position and velocity data to Vector3D format
	const primaryPosition = {
		x: latestCdm.sat1_x || 0,
		y: latestCdm.sat1_y || 0,
		z: latestCdm.sat1_z || 0
	};

	const primaryVelocity = {
		x: latestCdm.sat1_x_dot || 0,
		y: latestCdm.sat1_y_dot || 0,
		z: latestCdm.sat1_z_dot || 0
	};

	const secondaryPosition = {
		x: latestCdm.sat2_x || 0,
		y: latestCdm.sat2_y || 0,
		z: latestCdm.sat2_z || 0
	};

	const secondaryVelocity = {
		x: latestCdm.sat2_x_dot || 0,
		y: latestCdm.sat2_y_dot || 0,
		z: latestCdm.sat2_z_dot || 0
	};

	// Set custom ranges
	const deltaVRange = {
		min: -0.2,  // m/s
		max: 0.21,  // m/s
		step: 0.01  // m/s
	};

	const timeBeforeTCARange = {
		min: 0,    // hours
		max: 48,   // hours - can adjust based on your operational timeline
		step: 1    // hours
	};

	return (
		<div className={styles.container}>
			<Navbar userRole="Technical Operator" showLogout={true} />

			<main className={styles.main}>
				{/* Back Navigation */}
				<button onClick={() => window.history.back()} className={styles.backButton}>
					<ArrowLeft className={styles.backIcon} />
					Back to Events Dashboard
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
						<CesiumIntegration data={event} />
					</div>
				</div>

				{/* CDM Specific Section */}
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>CDM Specific</h2>
					<div className={styles.graphGrid}>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<IsolineGraph
									primaryPosition={primaryPosition}
									primaryVelocity={primaryVelocity}
									secondaryPosition={secondaryPosition}
									secondaryVelocity={secondaryVelocity}
									deltaVRange={deltaVRange}
									timeBeforeTCARange={timeBeforeTCARange}
									initialViewMode="isoline"
									numberOfIsolines={15}
									displayMode="missDistance"
									title="Miss Distance Tradespace"
								/>
							</div>
						</div>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<IsolineGraph 
									primaryPosition={primaryPosition}
									primaryVelocity={primaryVelocity}
									secondaryPosition={secondaryPosition}
									secondaryVelocity={secondaryVelocity}
									deltaVRange={deltaVRange}
									timeBeforeTCARange={timeBeforeTCARange}
									initialViewMode="isoline"
									numberOfIsolines={10}
									displayMode="probability"
									title="Collision Probability Tradespace"
								/>
							</div>
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
								<Probability
									id={event.id}
									sat1_object_designator={event.sat1_object_designator}
									sat2_object_designator={event.sat2_object_designator}
									cdms={event.cdms}
								/>
							</div>
						</div>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<MissDistance
									id={event.id}
									sat1_object_designator={event.sat1_object_designator}
									sat2_object_designator={event.sat2_object_designator}
									cdms={event.cdms}
								/>
							</div>
						</div>
						<div className={styles.graphCard}>
							<div className={styles.graphContent}>
								<RSSErrorEvolution
									id={event.id}
									sat1_object_designator={event.sat1_object_designator}
									sat2_object_designator={event.sat2_object_designator}
									cdms={event.cdms}
								/>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}

export default EventDetail