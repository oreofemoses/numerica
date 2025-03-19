import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorForm } from '../CalculatorForm';
import { calculationService } from '../../services/api';

// Mock the calculation service
jest.mock('../../services/api', () => ({
  calculationService: {
    calculate: jest.fn(),
    validateExpression: jest.fn()
  }
}));

describe('CalculatorForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<CalculatorForm onCalculate={jest.fn()} />);

    expect(screen.getByLabelText(/function/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initial value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/final value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/steps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CalculatorForm onCalculate={jest.fn()} />);
    
    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/function is required/i)).toBeInTheDocument();
      expect(screen.getByText(/initial value is required/i)).toBeInTheDocument();
      expect(screen.getByText(/final value is required/i)).toBeInTheDocument();
      expect(screen.getByText(/steps is required/i)).toBeInTheDocument();
    });
  });

  it('validates function expression', async () => {
    (calculationService.validateExpression as jest.Mock).mockResolvedValue(false);

    render(<CalculatorForm onCalculate={jest.fn()} />);
    
    const functionInput = screen.getByLabelText(/function/i);
    await userEvent.type(functionInput, 'invalid@@expression');
    fireEvent.blur(functionInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid function expression/i)).toBeInTheDocument();
    });
  });

  it('validates numerical inputs', async () => {
    render(<CalculatorForm onCalculate={jest.fn()} />);
    
    const stepsInput = screen.getByLabelText(/steps/i);
    await userEvent.type(stepsInput, '-10');
    fireEvent.blur(stepsInput);

    await waitFor(() => {
      expect(screen.getByText(/steps must be positive/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onCalculate = jest.fn();
    (calculationService.validateExpression as jest.Mock).mockResolvedValue(true);

    render(<CalculatorForm onCalculate={onCalculate} />);
    
    await userEvent.type(screen.getByLabelText(/function/i), 'x^2');
    await userEvent.type(screen.getByLabelText(/initial value/i), '0');
    await userEvent.type(screen.getByLabelText(/final value/i), '1');
    await userEvent.type(screen.getByLabelText(/steps/i), '100');

    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(() => {
      expect(onCalculate).toHaveBeenCalledWith({
        function: 'x^2',
        initialValue: 0,
        finalValue: 1,
        steps: 100
      });
    });
  });

  it('handles loading state', async () => {
    const onCalculate = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<CalculatorForm onCalculate={onCalculate} />);
    
    await userEvent.type(screen.getByLabelText(/function/i), 'x^2');
    await userEvent.type(screen.getByLabelText(/initial value/i), '0');
    await userEvent.type(screen.getByLabelText(/final value/i), '1');
    await userEvent.type(screen.getByLabelText(/steps/i), '100');

    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled();
  });

  it('displays error messages from the server', async () => {
    const error = new Error('Server error');
    const onCalculate = jest.fn(() => Promise.reject(error));
    render(<CalculatorForm onCalculate={onCalculate} />);
    
    await userEvent.type(screen.getByLabelText(/function/i), 'x^2');
    await userEvent.type(screen.getByLabelText(/initial value/i), '0');
    await userEvent.type(screen.getByLabelText(/final value/i), '1');
    await userEvent.type(screen.getByLabelText(/steps/i), '100');

    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it('resets form on successful calculation', async () => {
    const onCalculate = jest.fn(() => Promise.resolve());
    render(<CalculatorForm onCalculate={onCalculate} />);
    
    const functionInput = screen.getByLabelText(/function/i);
    await userEvent.type(functionInput, 'x^2');
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

    await waitFor(() => {
      expect(functionInput).toHaveValue('');
    });
  });
}); 