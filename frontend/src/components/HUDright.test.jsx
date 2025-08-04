import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HUDright } from './HUDright';

// 1. Mock HUDadd
jest.mock('../components/HUDadd', () => ({
  HUDadd: () => <div data-testid="hud-add">HUD Add Component</div>,
}));

// 2. Mock FullScreenMenu
jest.mock('./FullScreenMenu', () => ({
  FullScreenMenu: ({ isOpen, onClose }) => (
    <div data-testid="full-screen-menu">
      {isOpen ? 'Menu Open' : 'Menu Closed'}
      <button onClick={onClose}>Close Menu</button>
    </div>
  ),
}));

// 3. Mock ThemeManager
const mockSetTheme = jest.fn();
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn((t) => mockSetTheme(t)),
    addThemeChangeListener: jest.fn(() => () => {}),
  },
}));

beforeEach(() => {
  // Clear any stored token
  Storage.prototype.getItem = jest.fn();
  mockSetTheme.mockClear();
});

describe('HUDright Component', () => {
  it('renders HUDadd and the menu toggle button', () => {
    // logged out
    localStorage.getItem.mockReturnValueOnce(null);

    render(<HUDright />);

    // HUDadd should appear
    expect(screen.getByTestId('hud-add')).toBeInTheDocument();

    // Find the toggle button by its CSS class
    const allButtons = screen.getAllByRole('button');
    const menuToggle = allButtons.find(btn =>
      btn.className.includes('menubutton')
    );
    expect(menuToggle).toBeInTheDocument();
  });

  it('toggles the FullScreenMenu open and closed', () => {
    localStorage.getItem.mockReturnValueOnce(null);

    render(<HUDright />);

    const menuToggle = screen
      .getAllByRole('button')
      .find(btn => btn.className.includes('menubutton'));

    // Initially, menu is closed
    expect(screen.getByTestId('full-screen-menu')).toHaveTextContent('Menu Closed');

    // Open it
    fireEvent.click(menuToggle);
    expect(screen.getByTestId('full-screen-menu')).toHaveTextContent('Menu Open');

    // Close it via the "Close Menu" button
    fireEvent.click(screen.getByText('Close Menu'));
    expect(screen.getByTestId('full-screen-menu')).toHaveTextContent('Menu Closed');
  });
});
