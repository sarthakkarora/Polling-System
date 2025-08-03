import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import UserSelection from './components/UserSelection';
import StudentNameEntry from './components/StudentNameEntry';
import TeacherLogin from './components/TeacherLogin';
import StudentAuth from './components/StudentAuth';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

import Settings from './components/Settings';

import ProtectedRoute from './components/ProtectedRoute';
import GlobalStyles from './styles/GlobalStyles';
import './styles/global.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <GlobalStyles />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <div className="App">
          <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<UserSelection />} />
              <Route path="/student/name" element={<StudentNameEntry />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/student/auth" element={<StudentAuth />} />
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute userType="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <ProtectedRoute userType="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App; 