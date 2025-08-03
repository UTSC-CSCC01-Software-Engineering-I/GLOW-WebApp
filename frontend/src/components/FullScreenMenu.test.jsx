/**
 * @file FullScreenMenu.test.jsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullScreenMenu } from './FullScreenMenu';
import { useRouter } from 'next/navigation';
import { UnitManager } from '../utils/unitManager';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../utils/unitManager', () => ({
  UnitManager: {
    getUnit: jest.fn(() => 'C'),
    setUnit: jest.fn(),
    addUnitChangeListener: jest.fn(() => jest.fn()), // cleanup
  },
}));

describe('FullScreenMenu Component', () => {
  let mockPush;
  let mockOnClose;
  let mockToggleTheme;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockOnClose = jest.fn();
    mockToggleTheme = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    // Mock window.location.reload
    delete window.location;
    window.location = { reload: jest.fn() };
    localStorage.clear();
  });

  function renderMenu(props = {}) {
    return render(
      <FullScreenMenu
        isOpen={true}
        onClose={mockOnClose}
        theme="light"
        toggleTheme={mockToggleTheme}
        loggedIn={false}
        {...props}
      />
    );
  }

  it('renders menu when open', () => {
    renderMenu();
    expect(screen.getByText(/glow/i)).toBeInTheDocument();
    expect(screen.getByText(/Login \/ Sign Up/i)).toBeInTheDocument();
  });

  it('does not render overlay active class when closed', () => {
    render(
      <FullScreenMenu
        isOpen={false}
        onClose={mockOnClose}
        theme="light"
        toggleTheme={mockToggleTheme}
        loggedIn={false}
      />
    );
    const overlay = screen.getByTestId('overlay');
    expect(overlay.className).not.toContain('active');
  });

  it('calls onClose when overlay is clicked', () => {
    renderMenu();
    const overlay = document.querySelector('.map-mobile-sidebar-overlay');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates to /default on login click when logged out', () => {
    renderMenu({ loggedIn: false });
    fireEvent.click(screen.getByText(/Login \/ Sign Up/i));
    expect(mockPush).toHaveBeenCalledWith('/default');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates to /dashboard on dashboard click when logged in', () => {
    renderMenu({ loggedIn: true });
    fireEvent.click(screen.getByText(/User Dashboard/i));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates to /add-point when Add Water Point is clicked (logged in)', () => {
    renderMenu({ loggedIn: true });
    fireEvent.click(screen.getByText(/Add Water Point/i));
    expect(mockPush).toHaveBeenCalledWith('/add-point');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('toggles theme when theme toggle is clicked', () => {
    renderMenu();
    fireEvent.click(screen.getByText(/Switch to Dark Theme/i));
    expect(mockToggleTheme).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('toggles unit when unit toggle is clicked', () => {
    renderMenu();
    fireEvent.click(screen.getByText(/Switch to °F/i));
    expect(UnitManager.setUnit).toHaveBeenCalledWith('F');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears token and reloads window on logout click', () => {
    localStorage.setItem('authToken', 'test-token');
    renderMenu({ loggedIn: true });
    fireEvent.click(screen.getByText(/Logout/i));
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when ESC key is pressed', () => {
    renderMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
