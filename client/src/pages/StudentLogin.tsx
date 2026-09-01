import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Mail, Hash, ArrowRight, KeyRound, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
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
      loginStudent(data.student);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
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
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Vote className="w-7 h-7 text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-surface-900 tracking-tight">Student Verification</h1>
            <p className="text-surface-500 mt-1.5 text-sm">Authenticate to access your ballot</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step === 'credentials'
                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                : 'bg-accent-50 text-accent-700 border border-accent-100'
            }`}>
              {step === 'otp' ? <CheckCircle className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />} Identity
            </div>
            <div className="w-8 h-px bg-surface-200" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step === 'otp'
                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                : 'bg-surface-50 text-surface-400 border border-surface-200'
            }`}>
              <KeyRound className="w-3.5 h-3.5" /> OTP
            </div>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm overflow-hidden"
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
                transition={{ duration: 0.25 }}
                onSubmit={handleRequestOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Student ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
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
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Institutional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
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
                  className="btn-primary w-full mt-1 py-2.5 rounded-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Request OTP <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                {/* Welcome banner */}
                <div className="text-center p-3 rounded-lg bg-accent-50 border border-accent-100">
                  <p className="text-accent-700 text-sm">Welcome, <span className="font-semibold">{studentName}</span></p>
                  <p className="text-surface-400 text-xs mt-0.5">OTP sent to your email</p>
                </div>

                {/* Demo OTP */}
                <div className="p-3 rounded-lg bg-warning-50 border border-warning-100">
                  <p className="text-warning-600 text-xs font-medium mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Demo Mode — Your OTP:
                  </p>
                  <p className="text-2xl font-bold text-warning-700 tracking-[0.3em] text-center font-mono">{demoOtp}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Enter OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
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
                  className="btn-primary w-full py-2.5 rounded-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setError(''); }}
                  className="w-full py-2 text-surface-500 hover:text-surface-700 text-sm transition-colors text-center"
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
