import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { adminLogin } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await adminLogin(email, password);
      loginAdmin(data.admin);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl border border-surface-200 shadow-lg shadow-surface-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-surface-600" />
            </div>
            <h1 className="text-xl font-bold text-surface-900 tracking-tight">Admin Portal</h1>
            <p className="text-surface-500 mt-1.5 text-sm">Authorized personnel only</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@university.edu"
                  required
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1 py-2.5 rounded-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <Shield className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-surface-50 border border-surface-200 text-center">
            <p className="text-xs text-surface-400">
              Demo: <span className="text-surface-600 font-mono">admin@university.edu</span> / <span className="text-surface-600 font-mono">Admin@VoxUnite2024</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
