/**
 * @file AddPoint.test.jsx
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddPoint from './AddPoint';

// Mock APIs
jest.mock('../lib/api', () => ({
  authAPI: {
    isAuthenticated: jest.fn(),
    getProfile: jest.fn(),
  },
  pointsAPI: {
    getUserPoints: jest.fn(),
  },
}));

// Mock ThemeManager
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    addThemeChangeListener: jest.fn(() => jest.fn()), // returns cleanup fn
  },
}));

const { authAPI, pointsAPI } = require('../lib/api');

beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.useRealTimers();
});

describe('AddPoint Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock location
    delete window.location;
    window.location = { search: '', href: '' };
    // Mock geolocation
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn((success) =>
        success({ coords: { latitude: 10, longitude: 20 } })
      ),
    };
  });

  function mockAuthAndRender() {
    authAPI.isAuthenticated.mockReturnValue(true);
    authAPI.getProfile.mockResolvedValue({
      success: true,
      data: { user: { firstName: 'Test', email: 'test@example.com' } },
    });
    return render(<AddPoint />);
  }

  it('shows loading state initially and then renders form', async () => {
    mockAuthAndRender();

    // Loading spinner
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Wait for form after profile resolves
    await waitFor(() =>
      expect(screen.getByText(/Add a temperature point/i)).toBeInTheDocument()
    );
  });

  it('handles input changes and form submission success', async () => {
    mockAuthAndRender();
    await screen.findByText(/Add a temperature point/i);

    localStorage.setItem('authToken', 'mock-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    pointsAPI.getUserPoints.mockResolvedValue({
      success: true,
      data: [
        { lat: 10, lon: 20, temp: 30, timestamp: new Date().toISOString() },
      ],
    });

    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '30' } });

    fireEvent.click(screen.getByText(/Add Temperature Point/i));

    // Fast-forward the 1.5s delay
    await act(() => jest.advanceTimersByTime(1500));
    // Wait for modal
    expect(await screen.findByText('Temperature point added successfully')).toBeInTheDocument();
    expect(screen.getByText(/Success!/i)).toBeInTheDocument();
  });

  it('shows error if no token is present', async () => {
    mockAuthAndRender();
    await screen.findByText(/Add a temperature point/i);

    localStorage.removeItem('authToken');
    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '30' } });

    fireEvent.click(screen.getByText(/Add Temperature Point/i));

    await screen.findByText(/You must be logged in to add a point/i);
    expect(screen.getByText(/You must be logged in to add a point/i)).toBeInTheDocument();
  });

  it('handles API failure gracefully', async () => {
    mockAuthAndRender();
    await screen.findByText(/Add a temperature point/i);

    localStorage.setItem('authToken', 'mock-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '30' } });

    fireEvent.click(screen.getByText(/Add Temperature Point/i));

    // Fast-forward the 1.5s delay
    await act(() => jest.advanceTimersByTime(1500));
    // Now the error banner should appear
    expect(await screen.findByText(/Server error/i)).toBeInTheDocument();
  });
});
