import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isChatOpen: false,
  unreadCount: 0,
  participants: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      if (!state.isChatOpen) {
        state.unreadCount += 1;
      }
    },
    setChatHistory: (state, action) => {
      state.messages = action.payload;
      state.unreadCount = 0;
    },
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
      if (action.payload) {
        state.unreadCount = 0;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.unreadCount = 0;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action) => {
      const existingParticipant = state.participants.find(p => p.id === action.payload.id);
      if (!existingParticipant) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p.id !== action.payload.id);
    }
  },
});

export const { 
  addMessage, 
  setChatHistory, 
  setChatOpen, 
  clearMessages, 
  setParticipants,
  addParticipant,
  removeParticipant
} = chatSlice.actions;
export default chatSlice.reducer; 