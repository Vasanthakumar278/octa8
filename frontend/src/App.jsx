import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

import ThemeToggle from './components/ThemeToggle';

// ... (imports)

const InterviewApp = () => {
  const [interviewSession, setInterviewSession] = useState(null);
  const { logout, user } = useAuth();

  const startInterview = (data) => {
    setInterviewSession(data);
  };

  const endInterview = () => {
    setInterviewSession(null);
  };

  return (
    <div className="antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-200">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        {!interviewSession && (
          <span className="text-sm text-slate-500 dark:text-gray-400">Logged in as <strong className="text-slate-900 dark:text-white">{user?.username}</strong></span>
        )}
        <ThemeToggle />
        {!interviewSession && (
          <button
            onClick={logout}
            className="text-xs border border-red-500/50 text-red-500 px-3 py-1 rounded hover:bg-red-500/10"
          >
            Log Out
          </button>
        )}
      </div>

      {!interviewSession ? (
        <LandingPage onStart={startInterview} />
      ) : (
        <InterviewPage initialData={interviewSession} onEnd={endInterview} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <InterviewApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
