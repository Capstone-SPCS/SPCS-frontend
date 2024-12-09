import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Import your components
import Login from '../pages/Login'
import TechDashboard from '../pages/TechDashboard'
import FrontDashboard from '../pages/FrontDashboard'
import EventDetail from '../pages/EventDetail'
import GraphDetail from '../pages/GraphDetail'
import RawDetail from '../pages/RawDetail'
import useLogin from '../hooks/useLogin'

const AppRoutes: React.FC = () => {
	const { isAuthenticated } = useLogin()
	return (
		<Router>
			<Routes>
				{/* Public routes */}
				{!isAuthenticated ? (
					<>
						<Route path="*" element={<Navigate to="/login" />} />
						<Route path="/login" element={<Login />} />
					</>
				) : (
					// Authenticated routes
					<>
						<Route path="/tech/dashboard" element={<TechDashboard />} />
						<Route path="/front/dashboard" element={<FrontDashboard />} />
						<Route path="/event/:eventId" element={<EventDetail />} />
						<Route path="/graph/:type/:eventId" element={<GraphDetail />} />
						<Route path="/raw/:eventId" element={<RawDetail />} />
						<Route path="*" element={<Navigate to="/tech/dashboard" />} />
					</>
				)}
			</Routes>
		</Router>
	)
}

export default AppRoutes
