import '@testing-library/jest-dom';

// Mock CSS imports
jest.mock('./styles/HudBeaches.css', () => ({}));
jest.mock('./styles/homepage.css', () => ({}));

// Mock global objects
global.fetch = jest.fn();

// Setup window object
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  }
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
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

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});