import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CustomButton from './CustomButton'

// Mock the CSS module
jest.mock('./CustomButton.module.css', () => ({
	button: 'button-class'
}))

describe('CustomButton', () => {
	it('renders with children', () => {
		render(<CustomButton>Click me</CustomButton>)
		expect(screen.getByText('Click me')).toBeInTheDocument()
	})

	it('calls onClick handler when clicked', () => {
		const handleClick = jest.fn()
		render(<CustomButton onClick={handleClick}>Click me</CustomButton>)
		fireEvent.click(screen.getByText('Click me'))
		expect(handleClick).toHaveBeenCalledTimes(1)
	})

	it('renders with default type "button"', () => {
		render(<CustomButton>Click me</CustomButton>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
	})

	it('renders with specified type', () => {
		render(<CustomButton type="submit">Submit</CustomButton>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
	})

	it('passes additional props to button element', () => {
		render(
			<CustomButton data-testid="test-button" disabled>
				Click me
			</CustomButton>
		)
		const button = screen.getByTestId('test-button')
		expect(button).toBeDisabled()
	})
})
