// EventOverview.jsx
import React from 'react'
import styles from './EventOverview.module.css'

const EventOverview = ({
	id,
	eventId,
	objectType,
	poc,
	tca,
	numberOfCDMs
}: {
	id: string
	eventId: string
	objectType: string
	poc: string
	tca: string
	numberOfCDMs: number
}) => {
	return (
		<div className={styles.card}>
			<h3 className={styles.title}>Event{id}</h3>
			<div className={styles.content}>
				<div className={styles.field}>
					<span className={styles.label}>EventId</span>
					<span className={styles.value}>{eventId}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>Object type</span>
					<span className={styles.value}>{objectType}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>POC</span>
					<span className={styles.value}>{poc}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>TCA</span>
					<span className={styles.value}>{tca}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>Number of CDMs</span>
					<span className={styles.value}>{numberOfCDMs}</span>
				</div>
			</div>
		</div>
	)
}

export default EventOverview
