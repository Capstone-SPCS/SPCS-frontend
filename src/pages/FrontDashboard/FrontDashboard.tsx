// FrontDashboard.jsx
import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import CDMOverview from '../../components/CDMOverview'
import styles from './FrontDashboard.module.css'
import { useShortCDM } from '../../apiClient/useShortCDM'
import AlertModal from '../../components/AlertModal/AlertModal'
import CDMModal from '../../components/CDMModal/CDMModal'
import { useHasuraSubscription } from '../../apiClient/useWebsocket'

const FrontDashboard = () => {
	const { cdms, fetchShortCDMs } = useShortCDM()
	const [modalOpen, setModalOpen] = useState(false)
	const [selectedCDM, setSelectedCDM] = useState<number | null>(null)
	const [latestMessage, setLatestMessage] = useState(null)

	const { isConnected, data } = useHasuraSubscription('ws://104.131.168.48:8080')

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
		fetchShortCDMs()
	}, [])

	useEffect(() => {
		console.log('websocket data: ', data)
		//setLatestMessage(messages[messages.length - 1]?.cdm)
	}, [data])

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
			</main>
		</div>
	)
}

export default FrontDashboard
