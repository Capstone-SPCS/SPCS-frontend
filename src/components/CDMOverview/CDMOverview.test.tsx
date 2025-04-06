import React from 'react'
import { render, screen } from '@testing-library/react'
import CDMOverview from './CDMOverview'

// Mock the CSS module
jest.mock('./CDMOverview.module.css', () => ({
	card: 'card-class',
	header: 'header-class',
	title: 'title-class',
	alert: 'alert-class',
	content: 'content-class',
	field: 'field-class',
	label: 'label-class',
	value: 'value-class'
}))

describe('CDMOverview', () => {
	const mockProps = {
		id: '001',
		messageId: 'MSG001',
		eventId: 'EVT001',
		objectType: 'SATELLITE',
		poc: '0.001',
		tca: '2024-04-06T12:00:00Z',
		source: 'TEST',
		operator: 'OPERATOR1',
		hasAlert: false
	}

	it('renders all CDM information correctly', () => {
		render(<CDMOverview {...mockProps} />)

		// Check title
		expect(screen.getByText('CDM001')).toBeInTheDocument()

		// Check all fields
		expect(screen.getByText('MessageID')).toBeInTheDocument()
		expect(screen.getByText('MSG001')).toBeInTheDocument()

		expect(screen.getByText('EventId')).toBeInTheDocument()
		expect(screen.getByText('EVT001')).toBeInTheDocument()

		expect(screen.getByText('Object type')).toBeInTheDocument()
		expect(screen.getByText('SATELLITE')).toBeInTheDocument()

		expect(screen.getByText('POC')).toBeInTheDocument()
		expect(screen.getByText('0.001')).toBeInTheDocument()

		expect(screen.getByText('TCA')).toBeInTheDocument()
		expect(screen.getByText('2024-04-06T12:00:00Z')).toBeInTheDocument()

		expect(screen.getByText('Source')).toBeInTheDocument()
		expect(screen.getByText('TEST')).toBeInTheDocument()

		expect(screen.getByText('Operator')).toBeInTheDocument()
		expect(screen.getByText('OPERATOR1')).toBeInTheDocument()
	})

	it('shows alert when hasAlert is true', () => {
		render(<CDMOverview {...mockProps} hasAlert={true} />)
		expect(screen.getByText('Alert')).toBeInTheDocument()
	})

	it('does not show alert when hasAlert is false', () => {
		render(<CDMOverview {...mockProps} hasAlert={false} />)
		expect(screen.queryByText('Alert')).not.toBeInTheDocument()
	})

	it('renders with different props', () => {
		const differentProps = {
			id: '002',
			messageId: 'MSG002',
			eventId: 'EVT002',
			objectType: 'DEBRIS',
			poc: '0.002',
			tca: '2024-04-07T12:00:00Z',
			source: 'TEST2',
			operator: 'OPERATOR2',
			hasAlert: true
		}

		render(<CDMOverview {...differentProps} />)

		expect(screen.getByText('CDM002')).toBeInTheDocument()
		expect(screen.getByText('MSG002')).toBeInTheDocument()
		expect(screen.getByText('EVT002')).toBeInTheDocument()
		expect(screen.getByText('DEBRIS')).toBeInTheDocument()
		expect(screen.getByText('0.002')).toBeInTheDocument()
		expect(screen.getByText('2024-04-07T12:00:00Z')).toBeInTheDocument()
		expect(screen.getByText('TEST2')).toBeInTheDocument()
		expect(screen.getByText('OPERATOR2')).toBeInTheDocument()
		expect(screen.getByText('Alert')).toBeInTheDocument()
	})
})
