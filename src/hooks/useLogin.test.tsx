import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useLogin from './useLogin';
import loginReducer from '../redux/loginSlice';
import React from 'react';

// Create a wrapper with Redux Provider for renderHook
const createWrapper = () => {
  // Create a test store with the loginReducer
  const store = configureStore({
    reducer: {
      login: loginReducer,
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

// Mock the Supabase client
jest.mock('../supabase/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn((callback) => {
        // Store the callback to trigger it in tests
        (global as any).authCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
  },
}));

// Mock the operator API hook
jest.mock('../apiClient/useOperator', () => ({
  useGetOperator: () => ({
    operator: null,
    fetchOperator: jest.fn(),
  }),
}));

describe('useLogin Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login success flow', async () => {
    // Mock successful login response
    const supabase = require('../supabase/supabase').default;
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user123' },
        session: { access_token: 'token123' },
      },
      error: null,
    });

    // Render the hook with Redux Provider
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    // Call login
    await act(async () => {
      const success = await result.current.login('test@example.com', 'password123');
      expect(success).toBe(true);
    });

    // Verify supabase was called with correct params
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    // Verify loading and error states
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('login failure flow', async () => {
    // Mock failed login response
    const supabase = require('../supabase/supabase').default;
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    // Render the hook with Redux Provider
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    // Call login
    await act(async () => {
      const success = await result.current.login('wrong@example.com', 'wrongpassword');
      expect(success).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBe('Invalid login credentials');
  });

  test('logout flow', async () => {
    // Render the hook with Redux Provider
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    // Call logout
    await act(async () => {
      await result.current.logout();
    });

    // Verify supabase signOut was called
    const supabase = require('../supabase/supabase').default;
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
}); 