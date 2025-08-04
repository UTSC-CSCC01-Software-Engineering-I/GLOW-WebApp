/**
 * @file AddPoint.test.jsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';                // ← import act from react
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

describe('AddPoint Component', () => {
  beforeAll(() => {
    // Switch all tests to fake timers
    jest.useFakeTimers();
  });

  afterAll(() => {
    // Restore real timers after suite
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.location
    delete window.location;
    window.location = { search: '', href: '' };

    // Mock geolocation API
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

  it('shows loading spinner then the form', async () => {
    mockAuthAndRender();
    // Immediately see the loading text
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    // After profile loads, the form heading appears
    expect(
      await screen.findByText(/Add a temperature point to/i)
    ).toBeInTheDocument();
  });

  it('submits successfully and shows the fullscreen confirmation', async () => {
    mockAuthAndRender();
    // Wait for the form to appear
    await screen.findByText(/Add a temperature point to/i);

    // Provide token & mock network + verification
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

    // Fill out & submit
    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '30' } });
    fireEvent.click(screen.getByText(/Add Temperature Point/i));

    // Fast-forward the UX delay
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Now the modal text appears
    expect(
      await screen.findByText('Temperature point recorded')
    ).toBeInTheDocument();
    
    expect(
      screen.getByRole('heading', { name: /Success!/i })
    ).toBeInTheDocument();
  });

  it('shows an error if not logged in', async () => {
    mockAuthAndRender();
    await screen.findByText(/Add a temperature point to/i);

    localStorage.removeItem('authToken');
    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '30' } });
    fireEvent.click(screen.getByText(/Add Temperature Point/i));

    expect(
      await screen.findByText(/You must be logged in to add a point/i)
    ).toBeInTheDocument();
  });

  it('handles a server error gracefully', async () => {
    mockAuthAndRender();
    await screen.findByText(/Add a temperature point to/i);

    localStorage.setItem('authToken', 'mock-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: '30' } });
    fireEvent.click(screen.getByText(/Add Temperature Point/i));

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(
      await screen.findByText(/Server error/i)
    ).toBeInTheDocument();
  });
});
