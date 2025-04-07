import React from 'react'
import { render, screen } from '@testing-library/react'
import EventOverview from './EventOverview'

// Mock the CSS module
jest.mock('./EventOverview.module.css', () => ({
	card: 'card-class',
	title: 'title-class',
	content: 'content-class',
	field: 'field-class',
	label: 'label-class',
	value: 'value-class'
}))

describe('EventOverview', () => {
	const mockProps = {
		id: 'EVT001',
		sat1Designator: 'SAT001',
		sat2Designator: 'SAT002',
		tca: '2024-04-06T12:00:00Z',
		numberOfCDMs: 5
	}

	it('renders all event information correctly', () => {
		render(<EventOverview {...mockProps} />)

		// Check title
		expect(screen.getByText('EventEVT001')).toBeInTheDocument()

		// Check all fields
		expect(screen.getByText('EventId')).toBeInTheDocument()
		expect(screen.getByText('EVT001')).toBeInTheDocument()

		expect(screen.getByText('Sat 1 Designator')).toBeInTheDocument()
		expect(screen.getByText('SAT001')).toBeInTheDocument()

		expect(screen.getByText('Sat 2 Designator')).toBeInTheDocument()
		expect(screen.getByText('SAT002')).toBeInTheDocument()

		expect(screen.getByText('TCA')).toBeInTheDocument()
		expect(screen.getByText('2024-04-06T12:00:00Z')).toBeInTheDocument()

		expect(screen.getByText('Number of CDMs')).toBeInTheDocument()
		expect(screen.getByText('5')).toBeInTheDocument()
	})

	it('renders with different props', () => {
		const differentProps = {
			id: 'EVT002',
			sat1Designator: 'SAT003',
			sat2Designator: 'SAT004',
			tca: '2024-04-07T12:00:00Z',
			numberOfCDMs: 10
		}

		render(<EventOverview {...differentProps} />)

		expect(screen.getByText('EventEVT002')).toBeInTheDocument()
		expect(screen.getByText('SAT003')).toBeInTheDocument()
		expect(screen.getByText('SAT004')).toBeInTheDocument()
		expect(screen.getByText('2024-04-07T12:00:00Z')).toBeInTheDocument()
		expect(screen.getByText('10')).toBeInTheDocument()
	})
})
