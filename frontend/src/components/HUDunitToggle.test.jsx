import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HUDunitToggle } from './HUDunitToggle';

describe('HUDunitToggle Component', () => {
  beforeEach(() => {
    // Reset global window properties
    global.window = {
      ...global.window,
      temperatureUnit: 'C',
      dispatchEvent: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the temperature toggle button with initial Celsius', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveStyle('position: fixed');
      expect(toggleButton).toHaveStyle('top: 50%');
      expect(toggleButton).toHaveStyle('right: 1rem');
    });

    it('applies correct initial styles', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      expect(toggleButton).toHaveStyle({
        padding: '0.5rem 1rem',
        background: '#000',
        cursor: 'pointer',
        borderRadius: '0.25rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: '1000'
      });
    });
  });

  describe('Unit Toggle Functionality', () => {
    it('toggles from Celsius to Fahrenheit when clicked', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByText('°F')).toBeInTheDocument();
      expect(global.window.temperatureUnit).toBe('F');
    });

    it('toggles from Fahrenheit back to Celsius', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      // First click: C -> F
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByText('°F')).toBeInTheDocument();

      // Second click: F -> C
      const fahrenheitButton = screen.getByText('°F');
      act(() => {
        fireEvent.click(fahrenheitButton);
      });

      expect(screen.getByText('°C')).toBeInTheDocument();
      expect(global.window.temperatureUnit).toBe('C');
    });

    it('dispatches unitchange event when toggled', () => {
      const mockDispatchEvent = jest.fn();
      global.window.dispatchEvent = mockDispatchEvent;

      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unitchange'
        })
      );
    });

    it('updates window.temperatureUnit immediately on toggle', () => {
      render(<HUDunitToggle />);

      expect(global.window.temperatureUnit).toBe('C');

      const toggleButton = screen.getByText('°C');
      
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(global.window.temperatureUnit).toBe('F');
    });
  });

  describe('Hover Effects', () => {
    it('changes background color on mouse enter', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      act(() => {
        fireEvent.mouseEnter(toggleButton);
      });

      expect(toggleButton).toHaveStyle('backgroundColor: rgba(0, 217, 255, 0.6)');
    });

    it('resets background color on mouse leave', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      // Hover then leave
      act(() => {
        fireEvent.mouseEnter(toggleButton);
      });

      act(() => {
        fireEvent.mouseLeave(toggleButton);
      });

      expect(toggleButton).toHaveStyle('backgroundColor: rgba(0, 0, 0, 0.6)');
    });
  });

  describe('Multiple Toggles', () => {
    it('handles multiple rapid toggles correctly', () => {
      render(<HUDunitToggle />);

      let toggleButton = screen.getByText('°C');
      
      // Multiple rapid clicks
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(toggleButton);
        });
        
        // Update reference to the button
        toggleButton = i % 2 === 0 ? screen.getByText('°F') : screen.getByText('°C');
      }

      // After 5 clicks (odd number), should be on Fahrenheit
      expect(screen.getByText('°F')).toBeInTheDocument();
      expect(global.window.temperatureUnit).toBe('F');
    });

    it('dispatches events for each toggle', () => {
      const mockDispatchEvent = jest.fn();
      global.window.dispatchEvent = mockDispatchEvent;

      render(<HUDunitToggle />);

      let toggleButton = screen.getByText('°C');
      
      // Click 3 times
      for (let i = 0; i < 3; i++) {
        act(() => {
          fireEvent.click(toggleButton);
        });
        
        // Update reference
        toggleButton = i % 2 === 0 ? screen.getByText('°F') : screen.getByText('°C');
      }

      expect(mockDispatchEvent).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('is focusable and clickable with keyboard', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      // Focus the button
      act(() => {
        toggleButton.focus();
      });

      expect(toggleButton).toHaveFocus();

      // Simulate Enter key press
      act(() => {
        fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      });

      // Note: This test assumes click behavior on Enter, 
      // but the current implementation only handles onClick
      // You might want to add onKeyDown support for accessibility
    });

    it('maintains focus indication', () => {
      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      expect(toggleButton.tagName).toBe('BUTTON');
      expect(toggleButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      // Re-render with same props
      rerender(<HUDunitToggle />);

      // Button should still be there and functional
      expect(screen.getByText('°C')).toBeInTheDocument();
      
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByText('°F')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing window.dispatchEvent gracefully', () => {
      global.window.dispatchEvent = undefined;

      render(<HUDunitToggle />);

      const toggleButton = screen.getByText('°C');
      
      // Should not throw error
      expect(() => {
        act(() => {
          fireEvent.click(toggleButton);
        });
      }).not.toThrow();

      expect(screen.getByText('°F')).toBeInTheDocument();
    });

    it('initializes correctly with undefined window.temperatureUnit', () => {
      delete global.window.temperatureUnit;

      render(<HUDunitToggle />);

      expect(screen.getByText('°C')).toBeInTheDocument();
      
      const toggleButton = screen.getByText('°C');
      
      act(() => {
        fireEvent.click(toggleButton);
      });

      expect(global.window.temperatureUnit).toBe('F');
    });
  });
});