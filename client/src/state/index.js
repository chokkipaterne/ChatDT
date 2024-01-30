import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dtfile: null,
  filename: null,
  messages: [],
  columns: [],
  nodes: [],
};

export const dtSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.dtfile = action.payload.dtfile;
      state.filename = action.payload.filename;
      state.messages = action.payload.messages;
      state.columns = action.payload.columns;
      state.nodes = action.payload.nodes;
    },
    setDtfile: (state, action) => {
      state.dtfile = action.payload.dtfile;
    },
    setFilename: (state, action) => {
      state.filename = action.payload.filename;
    },
    setMessages: (state, action) => {
      state.messages = action.payload.messages;
    },
    setColumns: (state, action) => {
      state.columns = action.payload.columns;
    },
    setNodes: (state, action) => {
      state.nodes = action.payload.nodes;
    },
    setReset: (state) => {
      state.dtfile = null;
      state.filename = null;
      state.messages = [];
      state.columns = [];
      state.nodes = [];
    },
  },
});

export const {
  setInit,
  setDtfile,
  setFilename,
  setMessages,
  setColumns,
  setNodes,
  setReset,
} = dtSlice.actions;
export default dtSlice.reducer;
