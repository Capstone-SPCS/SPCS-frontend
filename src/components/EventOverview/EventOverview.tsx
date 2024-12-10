// EventOverview.jsx
import React from 'react'
import styles from './EventOverview.module.css'

const EventOverview = ({
	id,
	sat1Designator,
	sat2Designator,
	tca,
	numberOfCDMs
}: {
	id: string
	sat1Designator: string
	sat2Designator: string
	tca: string
	numberOfCDMs: number
}) => {
	return (
		<div className={styles.card}>
			<h3 className={styles.title}>Event{id}</h3>
			<div className={styles.content}>
				<div className={styles.field}>
					<span className={styles.label}>EventId</span>
					<span className={styles.value}>{id}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>Sat 1 Designator</span>
					<span className={styles.value}>{sat1Designator}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>Sat 2 Designator</span>
					<span className={styles.value}>{sat2Designator}</span>
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
