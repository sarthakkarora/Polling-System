import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userType: null, // 'teacher' or 'student'
  userName: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserType: (state, action) => {
      state.userType = action.payload;
      // For teachers, set authentication immediately
      if (action.payload === 'teacher') {
        state.isAuthenticated = true;
        state.userName = 'Teacher'; // Set default name for teacher
      }
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.userType = null;
      state.userName = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUserType, setUserName, logout } = authSlice.actions;
export default authSlice.reducer; 