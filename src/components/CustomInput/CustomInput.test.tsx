import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomInput from './CustomInput';

describe('CustomInput Component', () => {
  test('renders input with correct placeholder', () => {
    render(<CustomInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('updates value when changed', () => {
    const handleChange = jest.fn();
    render(<CustomInput value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('shows/hides password when eye icon is clicked', () => {
    render(<CustomInput type="password" placeholder="Password" />);
    
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
    
    // Find the eye icon button
    const eyeButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(eyeButton);
    
    // Input should now be type text
    expect(input).toHaveAttribute('type', 'text');
    
    // Click again should hide the password
    const eyeOffButton = screen.getByRole('button', { name: /hide password/i });
    fireEvent.click(eyeOffButton);
    
    // Input should be back to type password
    expect(input).toHaveAttribute('type', 'password');
  });

  test('applies focus class when input is focused', () => {
    const { container } = render(<CustomInput />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Check if the input has the focused class
    const focusedInput = container.querySelector('.focused');
    expect(focusedInput).not.toBeNull();
  });
}); 