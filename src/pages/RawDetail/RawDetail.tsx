// RawCDMPage.jsx
import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { CDMDataTable } from '../../components/CDMDataTable'
import styles from './RawDetail.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useRawCDM } from '../../apiClient/useRawCDM'
import { CDM } from '../../types/CDM'

const RawDetail: React.FC = () => {
	const [activeCDM, setActiveCDM] = useState(1)
	const navigate = useNavigate()
	const { eventId } = useParams()
	const { cdms, fetchCDMs } = useRawCDM()

	// Sample data - replace with actual data

	useEffect(() => {
		fetchCDMs(eventId || '')
	}, [])

	const objectToKeyValueArray = (obj: CDM): { key: string; value: string }[] => {
		if (obj) return Object.entries(obj).map(([key, value]) => ({ key, value })) || []
		return []
	}

	return (
		<div className={styles.container}>
			<Navbar userRole="Technical Operator" showLogout={true} />

			<main className={styles.main}>
				<div className={styles.header}>
					<button
						onClick={() => {
							navigate(-1)
						}}
						className={styles.backButton}>
						<ArrowLeft size={20} />
						<span>Back to Event Dashboard</span>
					</button>
					<h1 className={styles.title}>Raw CDM Data</h1>
				</div>

				<div className={styles.content}>
					<div className={styles.tabs}>
						{cdms.map((cdm) => (
							<button
								key={cdm.id}
								className={`${styles.tab} ${activeCDM === cdm.id ? styles.activeTab : ''}`}
								onClick={() => setActiveCDM(cdm.id)}>
								CDM {cdm.id}
							</button>
						))}
					</div>

					<div className={styles.dataContainer}>
						<CDMDataTable data={objectToKeyValueArray?.(cdms?.[activeCDM])} />
					</div>
				</div>
			</main>
		</div>
	)
}

export default RawDetail
