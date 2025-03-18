import React, { ReactNode, useEffect } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Filterbar.module.css'
import { useGetUserSubscriptions } from '../../apiClient/useGetFilters'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useLocation } from 'react-router-dom'
import { setSatelliteId, setSubscriptions } from '../../redux/filtersSlice'

export default function Filterbar({ children }: { children: ReactNode }) {
	const dispatch = useDispatch()
	const [isCollapsed, setIsCollapsed] = useState(false)
	const userId = useSelector((state: RootState) => state.login.id)
	const location = useLocation()
	const [myPreferencesSatelliteId, setMyPreferencesSatelliteID] = useState<number | null>(null)
	const [satelliteFilter, setSatelliteFIlter] = useState<string | null>(null)

	const { subscriptions, fetchSubscriptions, addSubscription, deleteSubscription } =
		useGetUserSubscriptions()

	useEffect(() => {
		if (userId) {
			fetchSubscriptions(userId)
		}
	}, [userId])

	useEffect(() => {
		const subIdxs = subscriptions.map((sub) => sub?.satellite_id?.toString())
		dispatch(setSubscriptions(subIdxs))
	}, [subscriptions])

	const handleAddSubscription = () => {
		if (typeof myPreferencesSatelliteId === 'number') {
			addSubscription(userId || '', myPreferencesSatelliteId)
		}
	}

	const handleDeleteSubscription = (satelliteId: number) => {
		deleteSubscription(userId!, satelliteId)
	}

	const handleFilterBySatellite = () => {
		dispatch(setSatelliteId(satelliteFilter))
	}

	return (
		<div className={styles.container}>
			<motion.div animate={{ width: isCollapsed ? 20 : 300 }} className={styles.sidebar}>
				<div className={styles.toggleContainer}>
					<button className={styles.toggleButton} onClick={() => setIsCollapsed(!isCollapsed)}>
						{isCollapsed ? <ChevronRight /> : <ChevronLeft />}
					</button>
					{/* Keep the Filters title next to the toggle button */}
					<h2 className={styles.title}>Filters</h2>
				</div>
				{!isCollapsed && (
					<div className={styles.filters}>
						<h4 className={styles.title}>Quick filters</h4>
						<label className={styles.filterOption}>
							<p>Satellite ID</p>
							<input
								type="text"
								onChange={(e) => {
									setSatelliteFIlter(e.target.value)
								}}
								placeholder="Enter Satellite Designator ID"
								className={styles.textField}
							/>
						</label>
						<button className={styles.updateButton} onClick={handleFilterBySatellite}>
							Apply
						</button>
						<h3>My Preferences:</h3>
						<div className={styles.myPreferences}>
							<h4>Satellite Subscriptions</h4>
							<span>List of current subscriptions: </span>
							<div className={styles.listOfSubs}>
								{subscriptions.map((subIndex) => (
									<div className={styles.subscriptionContainer}>
										{' '}
										- Sattelite: {subIndex.satellite_id}{' '}
										<span
											className={styles.subscriptionDelete}
											onClick={() => handleDeleteSubscription(parseInt(subIndex?.satellite_id!))}>
											X
										</span>
									</div>
								))}
							</div>

							<label className={styles.filterOption}>
								<p>Satellite ID</p>
								<input
									type="number"
									placeholder="Enter Satellite Designator ID"
									className={styles.textField}
									onChange={(e) => setMyPreferencesSatelliteID(Number(e.target.value))}
								/>
							</label>
							<button className={styles.updateButton} onClick={handleAddSubscription}>
								Add
							</button>
							<h4>Alerting Thresholds</h4>
							{location.pathname.includes('front') && (
								<label className={styles.filterOption}>
									<span>Probabliity of collision</span>
									<input type="text" placeholder="Enter a POC" className={styles.textField} />
								</label>
							)}
							<label className={styles.filterOption}>
								<span>Time of Closest Approach</span>
								<input type="text" placeholder="Enter a TCA" className={styles.textField} />
							</label>

							<button className={styles.updateButton}>Update</button>
						</div>
					</div>
				)}
			</motion.div>
			<div className={styles.mainContent}>{children}</div>
		</div>
	)
}
