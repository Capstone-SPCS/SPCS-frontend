import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import your components
import Login from '../pages/Login'
import TechDashboard from '../pages/TechDashboard'
import FrontDashboard from '../pages/FrontDashboard'
import EventDetail from '../pages/EventDetail'
import GraphDetail from '../pages/GraphDetail'
import RawDetail from '../pages/RawDetail'

const AppRoutes: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/tech/dashboard" element={<TechDashboard />} />
				<Route path="/front/dashboard" element={<FrontDashboard />} />
				<Route path="/event/:eventId" element={<EventDetail />} />
				<Route path="/graph/:type/:eventId" element={<GraphDetail />} />
				<Route path="/raw/:eventId" element={<RawDetail />} />
			</Routes>
		</Router>
	)
}

export default AppRoutes
