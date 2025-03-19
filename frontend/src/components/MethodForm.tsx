import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { setExpression, setResults } from '../store/slices/calculationSlice';
import { calculationService } from '../services/api';
import { selectExpression } from '../store/selectors';
import type { MethodConfig, Parameter, ParameterSet } from '../types';
import type { RootState } from '../store/store';
import { NumberInput } from './NumberInput';

interface MethodFormProps {
  methodConfig: MethodConfig;
  onCalculate?: () => void;
}

export const MethodForm: React.FC<MethodFormProps> = ({ methodConfig, onCalculate }) => {
  const dispatch = useDispatch();
  const expression = useSelector(selectExpression);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(methodConfig.algorithms[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // Get the current parameter set based on whether we have algorithm-specific parameters
  const getCurrentParameters = (): ParameterSet => {
    if (methodConfig.algorithmParameters && methodConfig.algorithmParameters[selectedAlgorithm]) {
      return methodConfig.algorithmParameters[selectedAlgorithm];
    }
    return methodConfig.parameters || {};
  };

  // Initialize parameters state with default values
  const [parameters, setParameters] = useState<Record<string, number>>(() => {
    const currentParams = getCurrentParameters();
    return Object.entries(currentParams).reduce<Record<string, number>>((acc, [key, param]) => ({
      ...acc,
      [key]: param.default
    }), {});
  });

  // Reset parameters when method or algorithm changes
  useEffect(() => {
    const currentParams = getCurrentParameters();
    const newParameters = Object.entries(currentParams).reduce<Record<string, number>>((acc, [key, param]) => ({
      ...acc,
      [key]: param.default
    }), {});
    setParameters(newParameters);
    setErrorState(null);
  }, [methodConfig.id, selectedAlgorithm]);

  const handleParameterChange = (key: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState(null);

    try {
      // Get current parameters for rendering and ensure values exist
      const currentParameters = getCurrentParameters();
      const currentParameterValues = Object.entries(currentParameters).reduce<Record<string, number>>((acc, [key, param]) => ({
        ...acc,
        [key]: parameters[key] ?? param.default
      }), {});

      const response = await calculationService.calculate({
        method: selectedAlgorithm,
        expression,
        parameters: {
          initialValue: currentParameterValues.initialValue ?? 0,
          finalValue: currentParameterValues.finalValue ?? 1,
          steps: currentParameterValues.steps ?? 100,
          tolerance: currentParameterValues.tolerance ?? 1e-6,
          ...currentParameterValues
        }
      });
      dispatch(setResults([response]));
      onCalculate?.();
    } catch (error) {
      setErrorState(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current parameters for rendering and ensure values exist
  const currentParameters = getCurrentParameters();
  const currentParameterValues = Object.entries(currentParameters).reduce<Record<string, number>>((acc, [key, param]) => ({
    ...acc,
    [key]: parameters[key] ?? param.default
  }), {});

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Method Description */}
      <div className="bg-gradient-to-br from-salt to-salt-muted/20 rounded-xl p-6 border border-salt-muted/20">
        <h3 className="text-xl font-medium text-pepper">{methodConfig.name}</h3>
        <p className="mt-2 text-pepper/70">{methodConfig.description}</p>
      </div>

      {/* Function Input */}
      <div className="space-y-2">
        <label htmlFor="expression" className="block text-sm font-medium text-pepper">
          Function Expression
        </label>
        <div className="relative">
          <input
            type="text"
            id="expression"
            value={expression}
            onChange={(e) => dispatch(setExpression(e.target.value))}
            placeholder="e.g., x^2 - 4"
            className="block w-full rounded-lg border-salt-muted/20 bg-salt shadow-sm focus:border-pepper focus:ring-pepper text-lg font-mono py-3 px-4"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-pepper/30">f(x)</span>
          </div>
        </div>
        <p className="text-sm text-pepper/50 mt-2">
          Enter a mathematical expression using standard notation
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-pepper">
          Algorithm
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {methodConfig.algorithms.map((algorithm: string) => (
            <motion.button
              key={algorithm}
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAlgorithm(algorithm)}
              className={`
                flex items-center space-x-3 p-4 rounded-xl border-2 transition-all
                ${selectedAlgorithm === algorithm
                  ? 'border-pepper bg-gradient-to-br from-salt to-salt-muted/20 shadow-sm'
                  : 'border-salt-muted/20 hover:border-pepper/50'
                }
              `}
            >
              <div className={`p-2 rounded-lg ${
                selectedAlgorithm === algorithm ? 'bg-pepper text-salt' : 'bg-salt-muted/10 text-pepper/70'
              }`}>
                <Play className="h-4 w-4" />
              </div>
              <span className={`text-base ${
                selectedAlgorithm === algorithm ? 'text-pepper font-medium' : 'text-pepper/70'
              }`}>
                {algorithm}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="space-y-6">
        {Object.entries(currentParameters).map(([key, param]) => (
          <NumberInput
            key={`${selectedAlgorithm}-${key}`}
            parameter={{ ...param, name: key }}
            value={parameters[key]}
            onChange={(value) => handleParameterChange(key, value)}
          />
        ))}
      </div>

      {/* Calculate Button */}
      <div className="flex justify-end pt-4">
        <motion.button
          type="submit"
          disabled={isLoading || !expression}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-salt bg-gradient-to-r from-pepper to-pepper/90 hover:from-pepper/90 hover:to-pepper/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pepper disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              <span>Calculate</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {errorState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-red-50/50 border border-red-200 rounded-xl"
          >
            <p className="text-red-800">{errorState}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}; 