import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Mail, Hash, ArrowRight, KeyRound, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { requestOtp, verifyOtp } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent } = useAuth();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await requestOtp(studentId, email);
      setDemoOtp(data.demoOtp);
      setStudentName(data.studentName);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await verifyOtp(studentId, email, otp);
      loginStudent(data.token, data.student);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="relative w-full max-w-md"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-2 bg-gradient-to-br from-primary-500/15 to-purple-500/15 rounded-3xl blur-2xl" />

        <div className="relative glass rounded-3xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/25">
              <Vote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Student Verification</h1>
            <p className="text-surface-400 mt-2 text-sm">Authenticate to access your ballot</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
              step === 'credentials'
                ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                : 'bg-accent-500/15 text-accent-300 border border-accent-500/20'
            }`}>
              {step === 'otp' ? <CheckCircle className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />} Identity
            </div>
            <div className="w-10 h-px bg-gradient-to-r from-white/20 to-white/5" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
              step === 'otp'
                ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                : 'bg-white/[0.03] text-surface-500 border border-white/5'
            }`}>
              <KeyRound className="w-3.5 h-3.5" /> OTP
            </div>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-300 text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form
                key="creds"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRequestOtp}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Student ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STU2024001"
                      required
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Institutional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@university.edu"
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request OTP <ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                {/* Welcome banner */}
                <div className="text-center p-4 rounded-xl bg-accent-500/8 border border-accent-500/15">
                  <p className="text-accent-300 text-sm">Welcome, <span className="font-semibold">{studentName}</span></p>
                  <p className="text-surface-500 text-xs mt-1">OTP sent to your email</p>
                </div>

                {/* Demo OTP */}
                <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/15">
                  <p className="text-amber-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Demo Mode — Your OTP:
                  </p>
                  <p className="text-3xl font-display font-bold text-amber-200 tracking-[0.3em] text-center">{demoOtp}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Enter OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                      className="input-field text-center text-lg tracking-[0.3em] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full rounded-xl"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-5 h-5" /></>}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setError(''); }}
                  className="w-full py-2 text-surface-500 hover:text-surface-300 text-sm transition-colors text-center"
                >
                  ← Back to credentials
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
