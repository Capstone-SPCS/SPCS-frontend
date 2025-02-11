import React from 'react'
import Modal from 'react-modal'
import styles from './CDMModal.module.css'

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

interface CDMModalProps {
	isOpen: boolean
	onClose: () => void
	onDispatch: () => void
	cdmData: SimplifiedCDM | undefined
}

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root')

const CDMModal = ({ isOpen, onClose, onDispatch, cdmData }: CDMModalProps) => {
	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			className={styles.modal}
			overlayClassName={styles.overlay}>
			<div className={styles.modalContent}>
				<h2 className={styles.title}>CDM Details</h2>

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
					<div className={styles.buttonGroup}>
						<button className={styles.buttonSecondary} onClick={onClose}>
							OK
						</button>
						<button className={styles.buttonPrimary} onClick={onDispatch}>
							Copy
						</button>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default CDMModal
