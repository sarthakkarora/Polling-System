import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  results: null,
  timeLeft: 0,
  isActive: false,
  hasAnswered: false,
  error: null,
  connectedUsers: {
    students: 0,
    teachers: 0,
    total: 0
  },
  userList: [],
  kickedOut: false,
  chatMessages: [], // Add chatMessages to state
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.isActive = action.payload?.isActive || false;
      state.hasAnswered = false;
      state.error = null;
    },
    setPollResults: (state, action) => {
      state.results = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    setPollError: (state, action) => {
      state.error = action.payload;
    },
    clearPollError: (state) => {
      state.error = null;
    },
    resetPoll: (state) => {
      state.currentPoll = null;
      state.results = null;
      state.timeLeft = 0;
      state.isActive = false;
      state.hasAnswered = false;
      state.error = null;
    },
    setConnectedUsers: (state, action) => {
      state.connectedUsers = action.payload;
    },
    setUserList: (state, action) => {
      state.userList = action.payload;
    },
    addUser: (state, action) => {
      const existingUser = state.userList.find(user => user.id === action.payload.id);
      if (!existingUser) {
        state.userList.push(action.payload);
      }
    },
    removeUser: (state, action) => {
      state.userList = state.userList.filter(user => user.id !== action.payload.id);
    },
    setKickedOut: (state, action) => {
      state.kickedOut = action.payload;
    },
    updateUserList: (state, action) => {
      state.userList = action.payload.users;
      state.connectedUsers = {
        total: action.payload.totalUsers,
        students: action.payload.students,
        teachers: action.payload.teachers
      };
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    setChatMessages: (state, action) => {
      state.chatMessages = action.payload;
    },
  },
});

export const {
  setCurrentPoll,
  setPollResults,
  setTimeLeft,
  setHasAnswered,
  setPollError,
  clearPollError,
  resetPoll,
  setConnectedUsers,
  setUserList,
  addUser,
  removeUser,
  setKickedOut,
  updateUserList,
  addChatMessage, // Export addChatMessage
  setChatMessages, // Export setChatMessages
} = pollSlice.actions;

export default pollSlice.reducer; 