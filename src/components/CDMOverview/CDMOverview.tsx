// CDMOverview.jsx
import React from 'react'
import styles from './CDMOverview.module.css'

const CDMOverview = ({
	id,
	messageId,
	eventId,
	objectType,
	poc,
	tca,
	source,
	operator,
	hasAlert = false
}: {
	id: string
	messageId: string
	eventId: string
	objectType: string
	poc: string
	tca: string
	source: string
	operator: string
	hasAlert?: boolean
}) => {
	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<h3 className={styles.title}>CDM{id}</h3>
				{hasAlert && <span className={styles.alert}>Alert</span>}
			</div>
			<div className={styles.content}>
				<div className={styles.field}>
					<span className={styles.label}>MessageID</span>
					<span className={styles.value}>{messageId}</span>
				</div>
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
					<span className={styles.label}>Source</span>
					<span className={styles.value}>{source}</span>
				</div>
				<div className={styles.field}>
					<span className={styles.label}>Operator</span>
					<span className={styles.value}>{operator}</span>
				</div>
			</div>
		</div>
	)
}

export default CDMOverview
