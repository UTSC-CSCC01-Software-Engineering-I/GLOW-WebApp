import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HUDlogin } from './HUDlogin';

// 1. Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(), // Mock push navigation
  }),
}));

// 2. Mock ThemeManager
const mockSetTheme = jest.fn();
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn((theme) => mockSetTheme(theme)),
    addThemeChangeListener: jest.fn(() => () => {}),
  },
}));

// 3. Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn();
  mockSetTheme.mockClear();
});

describe('HUDlogin Component', () => {
  it('renders Login/Sign up button when not logged in', () => {
    // localStorage returns null, so not logged in
    localStorage.getItem.mockReturnValueOnce(null);

    render(<HUDlogin />);

    expect(screen.getByText(/Login\/Sign up/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⏾' })).toBeInTheDocument(); // Theme toggle
  });

  it('renders Dashboard button when logged in', () => {
    // Simulate token in localStorage
    localStorage.getItem.mockReturnValueOnce('mock-token');

    render(<HUDlogin />);

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⏾' })).toBeInTheDocument(); // Theme toggle
  });

  it('toggles theme when theme button is clicked', () => {
    localStorage.getItem.mockReturnValueOnce(null); // not logged in
    render(<HUDlogin />);

    const toggleButton = screen.getByRole('button', { name: '⏾' });

    // Click the theme toggle button
    fireEvent.click(toggleButton);

    // Verify ThemeManager.setTheme is called with new theme
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
