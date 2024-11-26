// RawCDMPage.jsx
import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../../components/Navbar'
import CDMDataTable from '../../components/CDMDataTable'
import styles from './RawDetail.module.css'

const RawDetail: React.FC = () => {
	const [activeCDM, setActiveCDM] = useState(1)

	// Sample data - replace with actual data
	const sampleData = [
		{ key: 'Message ID', value: 'MSG001' },
		{ key: 'Creation Date', value: '2024-02-15' },
		{ key: 'Object Designator', value: 'SAT123' },
		{ key: 'Catalog ID', value: 'CAT456' },
		{ key: 'Object Type', value: 'PAYLOAD' },
		{ key: 'Operator', value: 'SpaceX' },
		{ key: 'Ephemeris Name', value: 'EPH789' },
		{ key: 'Covariance Method', value: 'CALCULATED' },
		{ key: 'Maneuverable', value: 'YES' }
	]

	return (
		<div className={styles.container}>
			<Navbar userRole="Technical Operator" showLogout={true} />

			<main className={styles.main}>
				<div className={styles.header}>
					<button
						onClick={() => {
							/* Handle navigation */
						}}
						className={styles.backButton}>
						<ArrowLeft size={20} />
						<span>Back to Event Dashboard</span>
					</button>
					<h1 className={styles.title}>Raw CDM Data</h1>
				</div>

				<div className={styles.content}>
					<div className={styles.tabs}>
						{[1, 2, 3].map((cdmNumber) => (
							<button
								key={cdmNumber}
								className={`${styles.tab} ${activeCDM === cdmNumber ? styles.activeTab : ''}`}
								onClick={() => setActiveCDM(cdmNumber)}>
								CDM {cdmNumber}
							</button>
						))}
					</div>

					<div className={styles.dataContainer}>
						<CDMDataTable data={sampleData} />
					</div>
				</div>
			</main>
		</div>
	)
}

export default RawDetail
