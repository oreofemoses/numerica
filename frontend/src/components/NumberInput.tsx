import React, { useState, useEffect } from 'react';
import { Parameter } from '../types';

interface NumberInputProps {
  parameter: Parameter;
  value?: number;
  onChange: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ parameter, value, onChange }) => {
  const [inputValue, setInputValue] = useState(() => {
    // Initialize with either the provided value or the parameter's default
    return (value !== undefined ? value : parameter.default).toString();
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update input value when prop changes, but only if it's different
    if (value !== undefined && value.toString() !== inputValue) {
      setInputValue(value.toString());
    }
  }, [value]);

  const validateAndUpdate = (val: string) => {
    // Allow scientific notation
    const scientificPattern = /^-?\d*\.?\d*(?:e[-+]?\d+)?$/i;
    if (!scientificPattern.test(val) && val !== '' && val !== '-') {
      return;
    }

    setInputValue(val);

    if (val === '' || val === '-') {
      setError('Please enter a value');
      return;
    }

    const numValue = Number(val);
    
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    if (parameter.min !== undefined && numValue < parameter.min) {
      setError(`Minimum value is ${parameter.min}`);
      return;
    }

    if (parameter.max !== undefined && numValue > parameter.max) {
      setError(`Maximum value is ${parameter.max}`);
      return;
    }

    // For tolerance, round to nearest reasonable precision instead of enforcing strict step
    if (parameter.name === 'tolerance') {
      const roundedValue = Number(numValue.toExponential(6));
      setError(null);
      onChange(roundedValue);
      return;
    }

    // For other numeric inputs, maintain step validation if specified
    if (parameter.step !== undefined) {
      const nearestStep = Math.round(numValue / parameter.step) * parameter.step;
      const roundedValue = Number(nearestStep.toFixed(10));
      setError(null);
      onChange(roundedValue);
      return;
    }

    setError(null);
    onChange(numValue);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={parameter.name} className="block text-sm font-medium text-pepper">
        {parameter.label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={parameter.name}
          value={inputValue}
          onChange={(e) => validateAndUpdate(e.target.value)}
          className={`block w-full rounded-lg border ${
            error ? 'border-red-300' : 'border-salt-muted/20'
          } bg-salt shadow-sm focus:border-pepper focus:ring-pepper text-lg py-2 px-3`}
        />
        {parameter.name === 'tolerance' && (
          <p className="mt-1 text-sm text-pepper/50">
            Enter a value between {parameter.min} and {parameter.max} (scientific notation like 1e-6 is supported)
          </p>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}; 