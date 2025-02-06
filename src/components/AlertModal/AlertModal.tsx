import React from 'react'
import Modal from 'react-modal'
import styles from './AlertModal.module.css'

interface SimplifiedCDM {
	id: number
	message_id: string
	event_id: string
	object_type: string
	poc: string // Probability of Collision
	tca: string // Time of Closest Approach
	source: string
	operator: string
}

interface AlertModalProps {
	isOpen: boolean
	onClose: () => void
	cdmData: SimplifiedCDM
}

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root')

const AlertModal = ({ isOpen, onClose, cdmData }: AlertModalProps) => {
	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			className={styles.modal}
			overlayClassName={styles.overlay}>
			<div className={styles.modalContent}>
				<h2 className={styles.title}>New CDM Alert</h2>

				<div className={styles.alert}>
					<svg
						className={styles.alertIcon}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					<p>New Conjunction Data Message Received</p>
				</div>

				<div className={styles.content}>
					<div className={styles.grid}>
						<div className={styles.label}>MessageID</div>
						<div className={styles.value}>{cdmData?.message_id}</div>

						<div className={styles.label}>EventId</div>
						<div className={styles.value}>{cdmData?.event_id}</div>

						<div className={styles.label}>Object type</div>
						<div className={styles.value}>{cdmData?.object_type}</div>

						<div className={styles.label}>POC</div>
						<div className={styles.value}>{cdmData?.poc}</div>

						<div className={styles.label}>TCA</div>
						<div className={styles.value}>{cdmData?.tca}</div>

						<div className={styles.label}>Source</div>
						<div className={styles.value}>{cdmData?.source}</div>

						<div className={styles.label}>Operator</div>
						<div className={styles.value}>{cdmData?.operator}</div>
					</div>
				</div>

				<div className={styles.footer}>
					<button className={styles.button} onClick={onClose}>
						Acknowledge Alert
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default AlertModal
