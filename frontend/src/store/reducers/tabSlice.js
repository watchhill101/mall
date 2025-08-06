import { createSlice } from '@reduxjs/toolkit'

const tabSlice = createSlice({
  name: 'tabs',
  initialState: {
    tabs: []
  },
  reducers: {
    addTab: (state, action) => {
      if (!state.tabs.some(tab => tab.key === action.payload.key)) {
        // 如果是首页标签，插入到第一位
        if (action.payload.key === '/home') {
          state.tabs.unshift(action.payload);
        } else {
          // 其他标签添加到末尾
          state.tabs.push(action.payload);
        }
        
        // 确保首页标签始终在第一位
        state.tabs.sort((a, b) => {
          if (a.key === '/home') return -1;
          if (b.key === '/home') return 1;
          return 0;
        });
      }
    },
    removeTab: (state, action) => {
      state.tabs = state.tabs.filter(tab => tab.key !== action.payload);
    },
    setTabs: (state, action) => {
      state.tabs = action.payload;
      // 确保首页标签始终在第一位
      state.tabs.sort((a, b) => {
        if (a.key === '/home') return -1;
        if (b.key === '/home') return 1;
        return 0;
      });
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
