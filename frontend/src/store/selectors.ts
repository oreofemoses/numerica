import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { CalculationResult } from '../types';

export const selectCalculation = (state: RootState) => state.calculation;

export const selectSelectedMethod = createSelector(
  selectCalculation,
  calculation => calculation.selectedMethod
);

export const selectExpression = createSelector(
  selectCalculation,
  calculation => calculation.expression || ''
);

export const selectResults = createSelector(
  selectCalculation,
  calculation => calculation.results as CalculationResult[]
);

export const selectActiveTab = createSelector(
  (state: RootState) => state.ui,
  ui => ui.activeTab
); 