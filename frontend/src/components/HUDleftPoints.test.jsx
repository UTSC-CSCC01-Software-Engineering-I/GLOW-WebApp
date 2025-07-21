import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HUDleftPoints } from './HUDleftPoints';

// Mock the CSS imports
jest.mock('../styles/HudBeaches.css', () => ({}));
jest.mock('../styles/homepage.css', () => ({}));

// Mock the MapComponent import
jest.mock('./MapComponent.jsx', () => ({
  globalBeach: null
}));

describe('HUDleftPoints Component', () => {
  const mockBeachData = [
    { siteName: 'Woodbine Beach', temp: 15.5 },
    { siteName: 'Cherry Beach', temp: 18.2 },
    { siteName: 'Centre Island Beach', temp: 12.8 },
    { siteName: 'Hanlan\'s Point Beach', temp: 20.1 }
  ];

  beforeEach(() => {
    // Reset global variables
    global.window = {
      ...global.window,
      globalTheme: 'light',
      handleMapSearch: jest.fn(),
      loadedAPI: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      innerWidth: 1024
    };

    // Mock globalBeach
    const MapComponent = require('./MapComponent.jsx');
    MapComponent.globalBeach = {
      items: mockBeachData
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the beaches list correctly', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Beaches')).toBeInTheDocument();
      });

      // Check if beach names are rendered
      expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      expect(screen.getByText('Cherry Beach')).toBeInTheDocument();
      expect(screen.getByText('Centre Island Beach')).toBeInTheDocument();
      expect(screen.getByText('Hanlan\'s Point Beach')).toBeInTheDocument();
    });

    it('displays loading state initially', () => {
      // Set globalBeach to null to simulate loading
      const MapComponent = require('./MapComponent.jsx');
      MapComponent.globalBeach = null;

      render(<HUDleftPoints />);

      expect(screen.getByText('Loading beaches...')).toBeInTheDocument();
    });

    it('displays correct temperature values', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('15.5')).toBeInTheDocument();
        expect(screen.getByText('18.2')).toBeInTheDocument();
        expect(screen.getByText('12.8')).toBeInTheDocument();
        expect(screen.getByText('20.1')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters beaches based on search input', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search beaches…');
      
      act(() => {
        fireEvent.change(searchInput, { target: { value: 'wood' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
        expect(screen.queryByText('Cherry Beach')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when search yields no matches', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search beaches…');
      
      act(() => {
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      });

      await waitFor(() => {
        expect(screen.getByText('No beaches found for "nonexistent"')).toBeInTheDocument();
      });
    });

    it('clears search when clear button is clicked', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search beaches…');
      
      act(() => {
        fireEvent.change(searchInput, { target: { value: 'wood' } });
      });

      await waitFor(() => {
        expect(searchInput.value).toBe('wood');
      });

      const clearButton = screen.getByText('✕');
      
      act(() => {
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(searchInput.value).toBe('');
        expect(screen.getByText('Cherry Beach')).toBeInTheDocument();
      });
    });

    it('is case insensitive', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search beaches…');
      
      act(() => {
        fireEvent.change(searchInput, { target: { value: 'CHERRY' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Cherry Beach')).toBeInTheDocument();
        expect(screen.queryByText('Woodbine Beach')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sort Functionality', () => {
    it('opens sort menu when sort button is clicked', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const sortButton = screen.getByText('Sort');
      
      act(() => {
        fireEvent.click(sortButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Temp ↑')).toBeInTheDocument();
        expect(screen.getByText('Temp ↓')).toBeInTheDocument();
        expect(screen.getByText('Reset')).toBeInTheDocument();
      });
    });

    it('sorts beaches by temperature ascending', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Centre Island Beach')).toBeInTheDocument();
      });

      const sortButton = screen.getByText('Sort');
      
      act(() => {
        fireEvent.click(sortButton);
      });

      const ascButton = screen.getByText('Temp ↑');
      
      act(() => {
        fireEvent.click(ascButton);
      });

      await waitFor(() => {
        const beachElements = screen.getAllByText(/Beach/);
        expect(beachElements[0]).toHaveTextContent('Centre Island Beach'); // 12.8°C
        expect(beachElements[1]).toHaveTextContent('Woodbine Beach'); // 15.5°C
      });
    });

    it('sorts beaches by temperature descending', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const sortButton = screen.getByText('Sort');
      
      act(() => {
        fireEvent.click(sortButton);
      });

      const descButton = screen.getByText('Temp ↓');
      
      act(() => {
        fireEvent.click(descButton);
      });

      await waitFor(() => {
        const beachElements = screen.getAllByText(/Beach/);
        expect(beachElements[0]).toHaveTextContent('Hanlan\'s Point Beach'); // 20.1°C
        expect(beachElements[1]).toHaveTextContent('Cherry Beach'); // 18.2°C
      });
    });

    it('resets sort order', async () => {
      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      // First sort
      const sortButton = screen.getByText('Sort');
      
      act(() => {
        fireEvent.click(sortButton);
      });

      const ascButton = screen.getByText('Temp ↑');
      
      act(() => {
        fireEvent.click(ascButton);
      });

      // Then reset
      act(() => {
        fireEvent.click(sortButton);
      });

      const resetButton = screen.getByText('Reset');
      
      act(() => {
        fireEvent.click(resetButton);
      });

      await waitFor(() => {
        const beachElements = screen.getAllByText(/Beach/);
        expect(beachElements[0]).toHaveTextContent('Woodbine Beach'); // Original order
      });
    });
  });

  describe('Beach Click Functionality', () => {
    it('calls handleMapSearch when beach is clicked', async () => {
      const mockHandleMapSearch = jest.fn();
      global.window.handleMapSearch = mockHandleMapSearch;

      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const beachElement = screen.getByText('Woodbine Beach').closest('div');
      
      act(() => {
        fireEvent.click(beachElement);
      });

      expect(mockHandleMapSearch).toHaveBeenCalledWith('Woodbine Beach');
    });

    it('handles missing handleMapSearch gracefully', async () => {
      global.window.handleMapSearch = undefined;

      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('Woodbine Beach')).toBeInTheDocument();
      });

      const beachElement = screen.getByText('Woodbine Beach').closest('div');
      
      // Should not throw error
      expect(() => {
        act(() => {
          fireEvent.click(beachElement);
        });
      }).not.toThrow();
    });
  });

  describe('Theme Support', () => {
    it('applies dark theme styles when theme is dark', async () => {
      global.window.globalTheme = 'dark';

      render(<HUDleftPoints />);

      await waitFor(() => {
        const container = screen.getByText('Beaches').closest('.boxwithpoints');
        expect(container).toHaveStyle('background-color: rgba(15, 15, 15, 0.85)');
      });
    });

    it('applies light theme styles when theme is light', async () => {
      global.window.globalTheme = 'light';

      render(<HUDleftPoints />);

      await waitFor(() => {
        const container = screen.getByText('Beaches').closest('.boxwithpoints');
        expect(container).toHaveStyle('background-color: rgba(255, 255, 255, 0.85)');
      });
    });

    it('responds to theme change events', async () => {
      let themeChangeListener;
      global.window.addEventListener = jest.fn((event, listener) => {
        if (event === 'themechange') {
          themeChangeListener = listener;
        }
      });

      render(<HUDleftPoints />);

      // Simulate theme change
      global.window.globalTheme = 'dark';
      
      act(() => {
        if (themeChangeListener) {
          themeChangeListener();
        }
      });

      await waitFor(() => {
        const container = screen.getByText('Beaches').closest('.boxwithpoints');
        expect(container).toHaveStyle('background-color: rgba(15, 15, 15, 0.85)');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty beach data', async () => {
      const MapComponent = require('./MapComponent.jsx');
      MapComponent.globalBeach = { items: [] };

      render(<HUDleftPoints />);

      await waitFor(() => {
        expect(screen.getByText('No beaches found')).toBeInTheDocument();
      });
    });

    it('handles missing siteName gracefully', async () => {
      const MapComponent = require('./MapComponent.jsx');
      MapComponent.globalBeach = {
        items: [
          { siteName: undefined, temp: 15.5 },
          { siteName: null, temp: 18.2 },
          { siteName: '', temp: 12.8 }
        ]
      };

      render(<HUDleftPoints />);

      await waitFor(() => {
        // Should render without crashing
        expect(screen.getByText('Beaches')).toBeInTheDocument();
      });
    });

    it('handles mobile screen size', async () => {
      global.window.innerWidth = 500;

      render(<HUDleftPoints />);

      await waitFor(() => {
        const container = screen.getByText('Beaches').closest('.boxwithpoints');
        expect(container).toHaveStyle('max-height: 80vh');
      });
    });
  });

  describe('Event Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const mockRemoveEventListener = jest.fn();
      global.window.removeEventListener = mockRemoveEventListener;

      const { unmount } = render(<HUDleftPoints />);
      
      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('themechange', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('dataloaded', expect.any(Function));
    });
  });
});