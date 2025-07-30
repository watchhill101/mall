import { createSlice } from '@reduxjs/toolkit'

const tabSlice = createSlice({
  name: 'tabs',
  initialState: {
    tabs: []
  },
  reducers: {
    addTab: (state, action) => {
      if (!state.tabs.some(tab => tab.key === action.payload.key)) {
        state.tabs.push(action.payload);
      }
    },
    removeTab: (state, action) => {
      state.tabs = state.tabs.filter(tab => tab.key !== action.payload);
    },
    setTabs: (state, action) => {
      state.tabs = action.payload;
    },
    editTab: (state, action) => {
      state.tabs[action.payload].outline = true;
    },
    timeTab: (state, action) => {
      state.tabs[action.payload].outline = false;
    }
  }
});

export const { addTab, removeTab, editTab,timeTab,setTabs } = tabSlice.actions
export default tabSlice
