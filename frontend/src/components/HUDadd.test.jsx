/**
 * @file HUDadd.test.jsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HUDadd } from './HUDadd';
import { ThemeManager } from '../utils/themeManager';
import { useRouter } from 'next/navigation';

// Mock ThemeManager
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    addThemeChangeListener: jest.fn(() => jest.fn()), // cleanup fn
  },
}));

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('HUDadd Component', () => {
  let pushMock;

  beforeEach(() => {
    jest.clearAllMocks();
    pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });
    localStorage.clear();
  });

  it('renders with default light theme', () => {
    render(<HUDadd />);
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText(/Add Point/i)).toBeInTheDocument();
  });

  it('navigates to /default when not logged in', () => {
    // No authToken in localStorage
    render(<HUDadd />);
    fireEvent.click(screen.getByText(/Add Point/i));
    expect(pushMock).toHaveBeenCalledWith('/default');
  });

  it('navigates to /add-point when logged in', () => {
    // Set authToken to simulate logged in state
    localStorage.setItem('authToken', 'mock-token');
    render(<HUDadd />);
    fireEvent.click(screen.getByText(/Add Point/i));
    expect(pushMock).toHaveBeenCalledWith('/add-point');
  });

  it('applies correct colors for light theme', () => {
    ThemeManager.getTheme.mockReturnValue('light');
    render(<HUDadd />);
    const button = screen.getByText(/Add Point/i);
    expect(button).toHaveStyle('color: white');
  });

  it('applies correct colors for dark theme', () => {
    ThemeManager.getTheme.mockReturnValue('dark');
    render(<HUDadd />);
    const button = screen.getByText(/Add Point/i);
    expect(button).toHaveStyle('color: black');
  });

  it('updates theme on ThemeManager change', () => {
    let themeChangeHandler;
    ThemeManager.addThemeChangeListener.mockImplementation((cb) => {
      themeChangeHandler = cb;
      return jest.fn();
    });

    render(<HUDadd />);

    // Simulate ThemeManager calling back with new theme
    themeChangeHandler('dark');

    const button = screen.getByText(/Add Point/i);
    expect(button).toHaveStyle('color: black');
  });
});
