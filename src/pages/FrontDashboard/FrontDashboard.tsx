// FrontDashboard.jsx
import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import CDMOverview from '../../components/CDMOverview'
import styles from './FrontDashboard.module.css'
import { useShortCDM } from '../../apiClient/useShortCDM'
import AlertModal from '../../components/AlertModal/AlertModal'
import CDMModal from '../../components/CDMModal/CDMModal'
import { useWebSocketClient } from '../../apiClient/useWebsocket'

const FrontDashboard = () => {
	const { totalCDMCount, cdms, fetchShortCDMs } = useShortCDM()
	const [modalOpen, setModalOpen] = useState(false)
	const [selectedCDM, setSelectedCDM] = useState<number | null>(null)
	const [latestMessage, setLatestMessage] = useState(null)
	const [currentPage, setCurrentPage] = useState(0)

	const { messages } = useWebSocketClient('ws://104.131.168.48:3001')

	// Calculate pagination
	const totalPages = Math.ceil((totalCDMCount || 1) / 9)

	const handleCDMClick = (id: number) => {
		// Handle navigation to event details
		setSelectedCDM(id)
		setModalOpen(true)
	}

	const handleCDMClose = () => {
		setModalOpen((prev) => !prev)
	}

	const handleAlertClose = () => {
		setLatestMessage(null)
	}

	const handleDispatch = () => {
		alert('DISPATCH FUNCTCTIONALITY TBD')
	}

	useEffect(() => {
		fetchShortCDMs(currentPage)
	}, [currentPage])

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber)
		window.scrollTo(0, 0) // Scroll to top when page changes
	}

	useEffect(() => {
		setLatestMessage(messages[messages.length - 1]?.cdm)
	}, [messages])
	console.log('messages', messages)

	return (
		<div className={styles.container}>
			<AlertModal isOpen={!!latestMessage} onClose={handleAlertClose} cdmData={cdms?.[0]} />
			<CDMModal
				isOpen={modalOpen}
				onClose={handleCDMClose}
				onDispatch={handleDispatch}
				cdmData={cdms?.find((cdm) => cdm.id === selectedCDM)}
			/>
			<Navbar />
			<main className={styles.main}>
				<h1 className={styles.title}>CDM Dashboard</h1>
				<div className={styles.grid}>
					{cdms.map((cdm) => (
						<div
							key={cdm.message_id}
							onClick={() => handleCDMClick(cdm.id)}
							className={styles.cardWrapper}>
							<CDMOverview
								key={cdm.event_id}
								id={cdm.id.toString()}
								messageId={cdm.message_id}
								eventId={cdm.event_id}
								objectType="Satellite"
								poc={cdm.poc}
								tca={cdm.tca}
								source={cdm.source}
								operator={cdm.operator}
								hasAlert={cdm.id === 1}
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

export default FrontDashboard
