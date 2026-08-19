import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen animated-gradient"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>;
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isStudent, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen animated-gradient"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>;
  return isStudent ? <>{children}</> : <Navigate to="/login" replace />;
};
