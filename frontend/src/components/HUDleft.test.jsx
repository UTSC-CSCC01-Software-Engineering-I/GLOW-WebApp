/**
 * @file HUDleft.test.jsx
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HUDleft } from './HUDleft';
import { ThemeManager } from '../utils/themeManager';

// Mock ThemeManager
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    addThemeChangeListener: jest.fn(() => jest.fn()), // returns cleanup fn
  },
}));

describe('HUDleft Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders GLOW and by MicroSofties text', () => {
    render(<HUDleft />);
    expect(screen.getByText('GLOW')).toBeInTheDocument();
    expect(screen.getByText('by MicroSofties')).toBeInTheDocument();
  });

  it('applies correct border and boxShadow for light theme', () => {
    ThemeManager.getTheme.mockReturnValue('light');
    render(<HUDleft />);
    const block = screen.getByText('GLOW').parentElement;
    expect(block).toHaveStyle('border: 1px solid rgba(255,255,255,0.3)');
    expect(block).toHaveStyle('box-shadow: 0 8px 32px rgba(0,0,0,0.1)');
  });

  it('applies correct border and boxShadow for dark theme', () => {
    ThemeManager.getTheme.mockReturnValue('dark');
    render(<HUDleft />);
    const block = screen.getByText('GLOW').parentElement;
    expect(block).toHaveStyle('border: 1px solid rgba(255,255,255,0.1)');
    expect(block).toHaveStyle('box-shadow: 0 8px 32px rgba(0,0,0,0.3)');
  });

  it('updates theme on ThemeManager change', () => {
    let themeChangeHandler;
    ThemeManager.addThemeChangeListener.mockImplementation((cb) => {
      themeChangeHandler = cb;
      return jest.fn();
    });

    render(<HUDleft />);

    // Simulate theme change to dark
    themeChangeHandler('dark');

    const block = screen.getByText('GLOW').parentElement;
    expect(block).toHaveStyle('border: 1px solid rgba(255,255,255,0.1)');
  });
});
