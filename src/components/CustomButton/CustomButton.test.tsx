import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomButton from './CustomButton';

describe('CustomButton Component', () => {
  test('renders button with correct text', () => {
    render(<CustomButton>Click Me</CustomButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick}>Click Me</CustomButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct button type', () => {
    render(<CustomButton type="submit">Submit</CustomButton>);
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');
  });

  test('applies additional props correctly', () => {
    render(<CustomButton data-testid="custom-button">Test</CustomButton>);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });
}); 