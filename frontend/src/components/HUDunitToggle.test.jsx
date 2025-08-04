// src/components/HUDunitToggle.test.jsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HUDunitToggle } from './HUDunitToggle';

// Mock UnitManager
const mockGetUnit = jest.fn();
const mockSetUnit = jest.fn();
let changeCallback;
const mockAddUnitChangeListener = jest.fn(cb => {
  changeCallback = cb;
  return () => { changeCallback = null; };
});

jest.mock('../utils/unitManager', () => ({
  UnitManager: {
    getUnit: () => mockGetUnit(),
    setUnit: newUnit => mockSetUnit(newUnit),
    addUnitChangeListener: cb => mockAddUnitChangeListener(cb),
  },
}));

describe('HUDunitToggle', () => {
  beforeEach(() => {
    mockGetUnit.mockClear();
    mockSetUnit.mockClear();
    mockAddUnitChangeListener.mockClear();
    changeCallback = null;
    // default starting unit
    mockGetUnit.mockReturnValue('C');
  });

  it('renders the initial unit from UnitManager.getUnit()', () => {
    mockGetUnit.mockReturnValue('F');
    render(<HUDunitToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('°F');
    // getUnit is called once for useState initializer and once in effect
    expect(mockGetUnit).toHaveBeenCalledTimes(2);
  });

  it('calls UnitManager.setUnit with the flipped unit on click', () => {
    mockGetUnit.mockReturnValue('C');
    render(<HUDunitToggle />);
    const btn = screen.getByRole('button');

    fireEvent.click(btn);
    expect(mockSetUnit).toHaveBeenCalledTimes(1);
    expect(mockSetUnit).toHaveBeenCalledWith('F');
  });

  it('updates displayed unit when UnitManager.addUnitChangeListener fires', () => {
    render(<HUDunitToggle />);
    expect(mockAddUnitChangeListener).toHaveBeenCalledTimes(1);
    expect(typeof changeCallback).toBe('function');

    // simulate external unit change
    act(() => changeCallback('F'));
    expect(screen.getByRole('button')).toHaveTextContent('°F');

    act(() => changeCallback('C'));
    expect(screen.getByRole('button')).toHaveTextContent('°C');
  });
});