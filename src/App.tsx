import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LetterProvider } from './contexts/LetterContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NewLetterPage from './pages/dashboard/NewLetterPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';

// Auth Guard Component
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authState } = useAuth();
  
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/new" element={
        <ProtectedRoute>
          <NewLetterPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/subscription" element={
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      } />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LetterProvider>
          <AppRoutes />
        </LetterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;