/**
 * @file WelcomeSection.test.jsx
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import WelcomeSection from './WelcomeSection';

// Helper to simulate window resize
const resizeWindow = (width) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

describe('WelcomeSection', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // control intervals
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders desktop view with initial message', () => {
    resizeWindow(1024); // desktop width
    render(<WelcomeSection />);

    expect(screen.getByText(/Welcome to GLOW/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Access latest beach data from the Great Lakes of Ontario/i)
    ).toBeInTheDocument();
  });

  it('renders mobile view when width is ≤ 768px', () => {
    resizeWindow(500); // simulate mobile width
    render(<WelcomeSection />);

    expect(screen.getByText(/Welcome to GLOW/i)).toBeInTheDocument();
    // Mobile should not show rotating description
    expect(
      screen.queryByText(/Access latest beach data from the Great Lakes of Ontario/i)
    ).not.toBeInTheDocument();
  });

  it('rotates messages every 4 seconds', () => {
    resizeWindow(1024);
    render(<WelcomeSection />);

    // Initial message
    expect(
      screen.getByText(/Access latest beach data from the Great Lakes of Ontario/i)
    ).toBeInTheDocument();

    // Advance 4 seconds → second message
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(
      screen.getByText(/Access historical data straight from the map/i)
    ).toBeInTheDocument();

    // Advance another 4 seconds → third message
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(
      screen.getByText(/Be part of a network/i)
    ).toBeInTheDocument();

    // Loop back to first message
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(
      screen.getByText(/Access latest beach data from the Great Lakes of Ontario/i)
    ).toBeInTheDocument();
  });
});
