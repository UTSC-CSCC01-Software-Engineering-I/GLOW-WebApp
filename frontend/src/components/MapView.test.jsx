/**
 * @file MapView.test.jsx
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// --- Mock the dynamic import for MapComponent ---
jest.mock('./MapComponent', () => () => <div data-testid="mock-map">Mock Map</div>);

// Since next/dynamic is used, we can mock it to just return the component directly
jest.mock('next/dynamic', () => {
  return jest.fn((importFunc, { ssr, loading }) => {
    // Call the importFunc immediately to resolve to our mock component
    const Component = require('./MapComponent').default || require('./MapComponent');
    return function DynamicMock(props) {
      return <Component {...props} />;
    };
  });
});

import { MapView } from './MapView';

describe('MapView', () => {
  it('renders the MapComponent via dynamic import', () => {
    render(<MapView />);

    // The mock MapComponent should render
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
  });

  it('applies correct wrapper styles (fullscreen fixed position)', () => {
    const { container } = render(<MapView />);
    const wrapper = container.firstChild;

    expect(wrapper).toHaveStyle({
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      zIndex: '-1',
    });
  });
});
