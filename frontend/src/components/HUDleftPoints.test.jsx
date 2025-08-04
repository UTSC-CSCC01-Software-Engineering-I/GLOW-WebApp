/**
 * @file HUDleftPoints.test.jsx
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { HUDleftPoints } from './HUDleftPoints';

// 1) Mock out the MapComponent import so that `globalBeach.items` is our fake data
jest.mock('./MapComponent.jsx', () => ({
  globalBeach: {
    items: [
      { siteName: 'Beach One', temp: 20, timestamp: '2025-08-03T10:00:00Z' },
      { siteName: 'Beach Two', temp: 15, timestamp: '2025-08-02T10:00:00Z' },
    ]
  }
}));

// 2) Stub out the TempFilterModal so it just renders a div we can query
jest.mock('./TempFilterModal', () => () => <div data-testid="temp-filter-modal" />);

// 3) Stub ThemeManager so it always returns "light"
jest.mock('../utils/themeManager', () => ({
  ThemeManager: {
    getTheme: jest.fn(() => 'light'),
    addThemeChangeListener: jest.fn(() => jest.fn()),
  },
}));

describe('HUDleftPoints Component', () => {
  it('renders beaches from globalBeach and shows correct count', async () => {
    render(<HUDleftPoints />);
    // Wait for the first beach to appear
    expect(await screen.findByText('Beach One')).toBeInTheDocument();
    expect(screen.getByText('Beach Two')).toBeInTheDocument();
    // The footer should read "Loaded 2 beaches"
    expect(screen.getByText(/Loaded 2 beach/i)).toBeInTheDocument();
  });

  it('filters beaches via search input', async () => {
    render(<HUDleftPoints />);
    await screen.findByText('Beach One');

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Two' } });

    // Beach One should disappear, Beach Two remain
    expect(screen.queryByText('Beach One')).toBeNull();
    expect(screen.getByText('Beach Two')).toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(clearBtn);

    // Both beaches are back
    expect(screen.getByText('Beach One')).toBeInTheDocument();
    expect(screen.getByText('Beach Two')).toBeInTheDocument();
  });

  it('sorts beaches ascending and descending', async () => {
    const { container } = render(<HUDleftPoints />);
    await screen.findByText('Beach One');

    const sortButton = screen.getByText('↕');

    // Ascending
    fireEvent.click(sortButton);
    fireEvent.click(screen.getByText('Temp ↑'));

    let items = container.querySelectorAll('.beach-item-hover');
    expect(items[0].textContent).toContain('Beach Two'); // 15°C first

    // Descending
    fireEvent.click(sortButton);
    fireEvent.click(screen.getByText('Temp ↓'));

    items = container.querySelectorAll('.beach-item-hover');
    expect(items[0].textContent).toContain('Beach One'); // 20°C first
  });

  it('resets sort when Reset is clicked', async () => {
    const { container } = render(<HUDleftPoints />);
    await screen.findByText('Beach One');

    // Open sort menu and click Reset
    fireEvent.click(screen.getByText('↕'));
    fireEvent.click(screen.getByText('Reset'));

    const items = container.querySelectorAll('.beach-item-hover');
    expect(items[0].textContent).toContain('Beach One');
    expect(items[1].textContent).toContain('Beach Two');
  });

  it('opens the filter modal when the ⋮ button is clicked', async () => {
    render(<HUDleftPoints />);
    await screen.findByText('Beach One');

    fireEvent.click(screen.getByText('⋮'));
    expect(screen.getByTestId('temp-filter-modal')).toBeInTheDocument();
  });

  it('updates displayed unit when unitchange event fires', async () => {
    render(<HUDleftPoints />);
    await screen.findByText('Beach One');

    // Initially should show °C somewhere
    expect(screen.getAllByText(/°C/).length).toBeGreaterThan(0);

    // Dispatch a unit‐change event
    await act(async () => {
      window.temperatureUnit = 'F';
      window.dispatchEvent(new Event('unitchange'));
    });

    // Now it should show °F instead
    expect(screen.getAllByText(/°F/).length).toBeGreaterThan(0);
  });
});
