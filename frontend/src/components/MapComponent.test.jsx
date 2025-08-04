/**
 * @file MapComponent.test.jsx
 */
import React from 'react';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import MapComponent from './MapComponent';

// --- Mock Leaflet entirely ---
jest.mock('leaflet', () => {
  // A fake map instance with every method your component uses
  const mapInstance = {
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    flyTo: jest.fn(),
    panTo: jest.fn(),
    once: jest.fn((event, cb) => { if (cb) cb(); }),
    project: jest.fn(() => ({ subtract: () => ({}) })),
    unproject: jest.fn(() => [0, 0]),
    getZoom: jest.fn(() => 12),
    remove: jest.fn(),              // <— stub out .remove()
    _themeCleanup: jest.fn(),       // <— stub out the cleanup handle
  };
  return {
    __esModule: true,
    default: {
      map: jest.fn(() => mapInstance),
      tileLayer: jest.fn(() => mapInstance),
      marker: jest.fn(() => ({
        on: jest.fn(),
        addTo: jest.fn(),
        setIcon: jest.fn(),
      })),
      divIcon: jest.fn(opts => opts),
      popup: jest.fn(() => ({
        setLatLng: jest.fn().mockReturnThis(),
        setContent: jest.fn().mockReturnThis(),
        openOn: jest.fn(),
      })),
    },
  };
});

// --- Mock Chart.js so .register(...) is a no-op ---
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  TimeScale: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  LineController: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Stub the date adapter (imported for side-effects)
jest.mock('chartjs-adapter-date-fns', () => {});

// Mock your UnitManager and temperatureUtils
const mockGetUnit = jest.fn(() => 'C');
let savedUnitCallback = null;
jest.mock('../utils/unitManager', () => ({
  UnitManager: {
    getUnit: () => mockGetUnit(),
    addUnitChangeListener: cb => {
      savedUnitCallback = cb;
      return () => {};
    },
    setUnit: jest.fn(),
  },
}));
jest.mock('../utils/temperatureUtils', () => ({
  formatTemperature: (t, unit) =>
    unit === 'F' ? ((t * 9) / 5 + 32).toFixed(1) : t,
}));

// Stub fetch so your data loader always resolves quickly
beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items: [] }),
  });
});
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  savedUnitCallback = null;
});

describe('MapComponent', () => {
  it('renders the legend with Celsius labels', () => {
    render(<MapComponent />);
    expect(screen.getByText('30°C')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('10°C')).toBeInTheDocument();
    expect(screen.getByText('0°C')).toBeInTheDocument();
  });

  it('toggles window.loadedAPI from true → false once data load finishes', async () => {
    render(<MapComponent />);
    // first effect should set it to true
    expect(window.loadedAPI).toBe(true);
    // after your background fetch + setLoading(false):
    await waitFor(() => {
      expect(window.loadedAPI).toBe(false);
    });
  });

  it('updates the legend when the unit-change listener fires', async () => {
    render(<MapComponent />);
    // initial unit is 'C'
    expect(screen.getByText('30°C')).toBeInTheDocument();

    // simulate unit change to Fahrenheit
    act(() => {
      savedUnitCallback('F');
    });

    await waitFor(() => {
      expect(screen.getByText('86°F')).toBeInTheDocument();
      expect(screen.getByText('68°F')).toBeInTheDocument();
      expect(screen.getByText('50°F')).toBeInTheDocument();
      expect(screen.getByText('32°F')).toBeInTheDocument();
    });
  });
});
