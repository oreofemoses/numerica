import { configureStore } from '@reduxjs/toolkit';
import calculationReducer from './slices/calculationSlice';
import uiReducer, { UIState } from './slices/uiSlice';

export interface RootState {
  calculation: ReturnType<typeof calculationReducer>;
  ui: UIState;
}

export const store = configureStore({
  reducer: {
    calculation: calculationReducer,
    ui: uiReducer,
  },
});

export type AppDispatch = typeof store.dispatch; 