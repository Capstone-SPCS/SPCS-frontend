import React from 'react'
import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'

// Mock the CSS module
jest.mock('./Navbar.module.css', () => ({
	navbar: 'navbar-class',
	content: 'content-class',
	logo: 'logo-class',
	logoImg: 'logo-img-class',
	logoText: 'logo-text-class',
	loginBtn: 'login-btn-class'
}))

// Mock the useLogin hook
jest.mock('../../hooks/useLogin', () => ({
	__esModule: true,
	default: () => ({
		logout: jest.fn(),
		isAuthenticated: true
	})
}))

describe('Navbar', () => {
	it('renders the logo and title', () => {
		render(<Navbar />)
		expect(screen.getByAltText('CSA Logo')).toBeInTheDocument()
		expect(screen.getByText('Space Collision Detection System')).toBeInTheDocument()
	})

	it('renders logout button when authenticated', () => {
		render(<Navbar />)
		expect(screen.getByText('Logout')).toBeInTheDocument()
	})
})
