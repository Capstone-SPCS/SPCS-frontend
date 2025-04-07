import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { CDMDataTable } from './CDMDataTable'

// Mock the CSS module
jest.mock('./CDMDataTable.module.css', () => ({
	tableContainer: 'table-container-class',
	table: 'table-class',
	row: 'row-class',
	key: 'key-class',
	value: 'value-class'
}))

describe('CDMDataTable', () => {
	const mockData = [
		{ key: 'Name', value: 'John Doe' },
		{ key: 'Age', value: '30' },
		{ key: 'Location', value: 'New York' }
	]

	it('renders all data rows', () => {
		render(<CDMDataTable data={mockData} />)

		mockData.forEach((item) => {
			expect(screen.getByText(item.key)).toBeInTheDocument()
			expect(screen.getByText(item.value)).toBeInTheDocument()
		})
	})

	it('renders empty table when no data provided', () => {
		render(<CDMDataTable data={[]} />)
		const table = screen.getByRole('table')
		expect(table).toBeInTheDocument()
		const rows = within(table).queryAllByRole('row')
		expect(rows).toHaveLength(0)
	})

	it('handles non-string values', () => {
		const dataWithNumbers = [
			{ key: 'Count', value: 42 },
			{ key: 'Price', value: 99.99 }
		]

		render(<CDMDataTable data={dataWithNumbers} />)
		expect(screen.getByText('42')).toBeInTheDocument()
		expect(screen.getByText('99.99')).toBeInTheDocument()
	})
})
