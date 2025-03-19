import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CalculationResult } from '../../types';

interface CalculationState {
  selectedMethod: 'root-finding' | 'differentiation' | 'integration';
  expression: string;
  results: CalculationResult[];
}

const initialState: CalculationState = {
  selectedMethod: 'root-finding',
  expression: '',
  results: [],
};

const calculationSlice = createSlice({
  name: 'calculation',
  initialState,
  reducers: {
    setSelectedMethod: (state, action: PayloadAction<CalculationState['selectedMethod']>) => {
      state.selectedMethod = action.payload;
      state.results = [];
    },
    setExpression: (state, action: PayloadAction<string>) => {
      state.expression = action.payload;
    },
    setResults: (state, action: PayloadAction<CalculationResult[]>) => {
      state.results = action.payload;
    },
  },
});

export const { setSelectedMethod, setExpression, setResults } = calculationSlice.actions;
export default calculationSlice.reducer; 