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
      loginAdmin(data.token, data.admin);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 grid-pattern" />
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-2 bg-gradient-to-br from-primary-700/15 to-purple-700/15 rounded-3xl blur-2xl" />
        <div className="relative glass rounded-3xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-700/25">
              <Shield className="w-8 h-8 text-primary-300" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-surface-400 mt-2 text-sm">Authorized personnel only</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-300 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
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
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
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
              className="btn-primary w-full mt-2 rounded-xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <Shield className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-xs text-surface-500">
              Demo: <span className="text-surface-400 font-mono">admin@university.edu</span> / <span className="text-surface-400 font-mono">Admin@VoxUnite2024</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
