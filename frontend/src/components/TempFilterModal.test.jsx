/**
 * @file TempFilterModal.test.jsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TempFilterModal from './TempFilterModal';

// Ensure portal works in tests by appending to document.body
beforeEach(() => {
  // jsdom already provides document.body, no extra setup needed
});

describe('TempFilterModal', () => {
  const defaultProps = {
    show: true,
    onClose: jest.fn(),
    theme: 'light',
    tempFilter: { min: '', max: '' },
    setTempFilter: jest.fn(),
    applyTempFilter: jest.fn(),
    resetTempFilter: jest.fn(),
  };

  it('does not render when show is false', () => {
    const { container } = render(<TempFilterModal {...defaultProps} show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content when show is true', () => {
    render(<TempFilterModal {...defaultProps} />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Filter beaches by temperature range (°C)')).toBeInTheDocument();
    expect(screen.getByLabelText(/Minimum °C/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maximum °C/i)).toBeInTheDocument();
  });

  it('calls setTempFilter on input changes', () => {
    render(<TempFilterModal {...defaultProps} />);

    const minInput = screen.getByLabelText(/Minimum °C/i);
    fireEvent.change(minInput, { target: { value: '10' } });
    expect(defaultProps.setTempFilter).toHaveBeenCalled();

    const maxInput = screen.getByLabelText(/Maximum °C/i);
    fireEvent.change(maxInput, { target: { value: '25' } });
    expect(defaultProps.setTempFilter).toHaveBeenCalledTimes(2);
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<TempFilterModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls resetTempFilter when Reset button is clicked', () => {
    render(<TempFilterModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Reset'));
    expect(defaultProps.resetTempFilter).toHaveBeenCalled();
  });

  it('calls applyTempFilter when Apply Filter button is clicked', () => {
    render(<TempFilterModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Apply Filter'));
    expect(defaultProps.applyTempFilter).toHaveBeenCalled();
  });

  it('closes when clicking overlay (outside content)', () => {
    render(<TempFilterModal {...defaultProps} />);

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay); // overlay click triggers onClose
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does NOT close when clicking inside modal content', () => {
    render(<TempFilterModal {...defaultProps} />);

    const modalContent = screen.getByText('Filter');
    fireEvent.click(modalContent); // clicking inside should not close
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
