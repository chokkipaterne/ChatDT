import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dtfile: null,
  filename: null,
  messages: [],
  columns: [],
  nodes: [],
  table: [],
  instructions: {},
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
      state.table = action.payload.table;
      state.instructions = action.payload.instructions;
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
    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    setColumns: (state, action) => {
      state.columns = action.payload.columns;
    },
    setNodes: (state, action) => {
      state.nodes = action.payload.nodes;
    },
    setTable: (state, action) => {
      state.table = action.payload.table;
    },
    setInstructions: (state, action) => {
      state.instructions = action.payload.instructions;
    },
    updateInstructions: (state, action) => {
      state.instructions = { ...state.instructions, ...action.payload };
    },
    setReset: (state) => {
      state.dtfile = null;
      state.filename = null;
      state.messages = [];
      state.columns = [];
      state.nodes = [];
      state.table = [];
      state.instructions = {};
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
  setTable,
  setReset,
  setInstructions,
  addMessage,
  updateInstructions,
} = dtSlice.actions;
export default dtSlice.reducer;
