// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !(user.role === 'admin' || user.role === 'superadmin')) {
    // Logged in but not an admin
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the child route
  return <Outlet />;
};

export default ProtectedRoute;
