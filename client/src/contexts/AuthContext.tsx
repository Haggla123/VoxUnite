import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAdminProfile } from '../lib/api';

interface AuthState {
  adminToken: string | null;
  studentToken: string | null;
  admin: any | null;
  student: any | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  loginAdmin: (token: string, admin: any) => void;
  loginStudent: (token: string, student: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    adminToken: localStorage.getItem('adminToken'),
    studentToken: localStorage.getItem('studentToken'),
    admin: null,
    student: JSON.parse(localStorage.getItem('studentData') || 'null'),
    isAdmin: !!localStorage.getItem('adminToken'),
    isStudent: !!localStorage.getItem('studentToken'),
    isLoading: true,
  });

  useEffect(() => {
    const init = async () => {
      if (state.adminToken) {
        try {
          const { data } = await getAdminProfile();
          setState(s => ({ ...s, admin: data, isAdmin: true, isLoading: false }));
        } catch { localStorage.removeItem('adminToken'); setState(s => ({ ...s, adminToken: null, admin: null, isAdmin: false, isLoading: false })); }
      } else { setState(s => ({ ...s, isLoading: false })); }
    };
    init();
  }, []);

  const loginAdmin = (token: string, admin: any) => {
    localStorage.setItem('adminToken', token);
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    setState({ adminToken: token, studentToken: null, admin, student: null, isAdmin: true, isStudent: false, isLoading: false });
  };

  const loginStudent = (token: string, student: any) => {
    localStorage.setItem('studentToken', token);
    localStorage.setItem('studentData', JSON.stringify(student));
    localStorage.removeItem('adminToken');
    setState({ adminToken: null, studentToken: token, admin: null, student, isAdmin: false, isStudent: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    setState({ adminToken: null, studentToken: null, admin: null, student: null, isAdmin: false, isStudent: false, isLoading: false });
  };

  return <AuthContext.Provider value={{ ...state, loginAdmin, loginStudent, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
