// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the process.env values for testing
process.env.REACT_APP_SUPABASE_URL = 'https://test-supabase-url.co/';
process.env.REACT_APP_SUPABASE_KEY = 'test-supabase-key';
process.env.REACT_APP_EXPRESS_URL = 'http://localhost:3001/api/graphql';
process.env.REACT_APP_CESIUM_TOKEN = 'test-cesium-token';

// Mock window.scrollTo to prevent errors in tests
window.scrollTo = jest.fn();

// Create mock for any unimplemented browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  
  constructor() {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }
  
  disconnect() {
    return;
  }
  
  observe() {
    return;
  }
  
  takeRecords() {
    return [];
  }
  
  unobserve() {
    return;
  }
}

global.IntersectionObserver = MockIntersectionObserver; 