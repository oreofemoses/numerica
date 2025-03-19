import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  activeTab: 'parameters' | 'results' | 'visualization';
  isExpressionValid: boolean;
  showAdvancedOptions: boolean;
}

const initialState: UIState = {
  activeTab: 'parameters',
  isExpressionValid: true,
  showAdvancedOptions: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setExpressionValid: (state, action: PayloadAction<boolean>) => {
      state.isExpressionValid = action.payload;
    },
    toggleAdvancedOptions: (state) => {
      state.showAdvancedOptions = !state.showAdvancedOptions;
    },
  },
});

export const {
  setActiveTab,
  setExpressionValid,
  toggleAdvancedOptions,
} = uiSlice.actions;

export default uiSlice.reducer; 