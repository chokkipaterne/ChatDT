import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  dtfile: null,
};

export const dtSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.dtfile = action.payload.dtfile;
      state.messages = action.payload.messages;
    },
    setMessages: (state, action) => {
      state.messages = action.payload.messages;
    },
    setReset: (state) => {
      state.dtfile = null;
      state.messages = [];
    },
  },
});

export const { setInit, setMessages, setReset } = dtSlice.actions;
export default dtSlice.reducer;
