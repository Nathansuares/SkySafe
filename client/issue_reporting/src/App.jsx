import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import IssueReporting from './pages/IssueReporting';
import DocumentsPage from './pages/Documents'; // Correctly import DocumentsPage
import Circulars from './pages/Circulars'; // Assuming Circulars is also a page

// Helper to decode JWT and get user role
const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

// Protected route component for admin
const ProtectedRoute = ({ children }) => {
    const userRole = getUserRole();
    if (userRole !== 'admin') {
        // Redirect them to the login page, but save the current location they were
        // trying to go to when they were redirected.
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <div className="bg-gray-800 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md mx-auto bg-gray-200 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-700" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/report" element={<IssueReporting />} />
            <Route path="/documents" element={<DocumentsPage />} /> {/* Use DocumentsPage component */}
            <Route path="/circulars" element={<Circulars />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;