// src/components/HUDloading.test.jsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { HUDloading } from './HUDloading';

// 1. Mock next/navigation so useRouter() won’t throw
jest.mock('next/navigation', () => ({
  useRouter: () => ({})
}));

// 2. Mock ThemeManager
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    addThemeChangeListener: jest.fn(() => () => {})
  }
}));

describe('HUDloading Component', () => {
  beforeEach(() => {
    // clean up any leftover value
    delete window.loadedAPI;
  });

  it('renders the loading message initially', () => {
    // by default loading=true in state
    render(<HUDloading />);
    expect(screen.getByText(/Fetching latest data from api/i)).toBeInTheDocument();
  });

  it('switches to "Latest data loaded!" when window.loadedAPI is false and dataloaded fires', () => {
    // Simulate the API having finished (loadedAPI=false)
    window.loadedAPI = false;

    render(<HUDloading />);

    // fire the event so the effect runs and updates state
    act(() => {
      window.dispatchEvent(new Event('dataloaded'));
    });

    expect(screen.getByText(/Latest data loaded!/i)).toBeInTheDocument();
  });

  it('updates loading state on subsequent dataloaded events', () => {
    // Start in loading=true
    render(<HUDloading />);
    expect(screen.getByText(/Fetching latest data/i)).toBeInTheDocument();

    // Now simulate loadedAPI false
    window.loadedAPI = false;
    act(() => {
      window.dispatchEvent(new Event('dataloaded'));
    });

    expect(screen.getByText(/Latest data loaded!/i)).toBeInTheDocument();
  });
});
