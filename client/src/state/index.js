import { createSlice } from '@reduxjs/toolkit';

const init_tree_layout = {
  root_color: 'red',
  root_size: 30,
  branch_color: 'blue',
  branch_size: 20,
  leaf_color: 'green',
  leaf_size: 25,
};
const initialState = {
  dtfile: null,
  filename: null,
  messages: [],
  columns: [],
  table: [],
  instructions: {},
  tree_layout: init_tree_layout,
  has_tree: false,
  response_filename: null,
  unique_values: {},
  unique_vals: [],
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
      state.table = action.payload.table;
      state.instructions = action.payload.instructions;
      state.tree_layout = init_tree_layout;
      state.has_tree = action.payload.has_tree;
      state.response_filename = null;
      state.unique_values = {};
      state.unique_vals = [];
    },
    setDtfile: (state, action) => {
      state.dtfile = action.payload.dtfile;
    },
    setFilename: (state, action) => {
      state.filename = action.payload.filename;
    },
    setResponseFilename: (state, action) => {
      state.response_filename = action.payload.response_filename;
    },
    setMessages: (state, action) => {
      state.messages = action.payload.messages;
    },
    setTreeLayout: (state, action) => {
      state.tree_layout = action.payload.tree_layout;
    },
    updateTreeLayout: (state, action) => {
      state.tree_layout = { ...state.tree_layout, ...action.payload };
    },
    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    setColumns: (state, action) => {
      state.columns = action.payload.columns;
    },
    setTable: (state, action) => {
      state.table = action.payload.table;
    },
    setInstructions: (state, action) => {
      state.instructions = action.payload.instructions;
    },
    setUniqueValues: (state, action) => {
      state.unique_values = action.payload.unique_values;
    },
    setUniqueVals: (state, action) => {
      state.unique_vals = action.payload.unique_vals;
    },
    updateInstructions: (state, action) => {
      state.instructions = { ...state.instructions, ...action.payload };
    },
    setHasTree: (state, action) => {
      state.has_tree = action.payload.has_tree;
    },
    setReset: (state) => {
      state.dtfile = null;
      state.filename = null;
      state.messages = [];
      state.columns = [];
      state.table = [];
      state.instructions = {};
      state.tree_layout = init_tree_layout;
      state.has_tree = false;
      state.response_filename = null;
      state.unique_values = {};
      state.unique_vals = [];
    },
  },
});

export const {
  setInit,
  setDtfile,
  setFilename,
  setMessages,
  setColumns,
  setTable,
  setReset,
  setInstructions,
  setTreeLayout,
  setHasTree,
  setResponseFilename,
  updateTreeLayout,
  addMessage,
  updateInstructions,
  setUniqueValues,
  setUniqueVals,
} = dtSlice.actions;
export default dtSlice.reducer;
