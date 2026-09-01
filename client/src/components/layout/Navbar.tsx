import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Vote, LogOut, Menu, X, Home, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAdmin, isStudent, admin, student, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
  const isLanding = location.pathname === '/';

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const navLinkClass = (path: string) =>
    `px-3 py-2 text-sm transition-colors ${
      isActive(path)
        ? 'text-surface-900 font-medium'
        : 'text-surface-500 hover:text-surface-900'
    }`;

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${isLanding ? 'bg-white/80 backdrop-blur-xl border-b border-surface-200/50' : 'bg-white border-b border-surface-200'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center">
              <Vote className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-surface-900 tracking-tight">
              VoxUnite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Links */}
            {!isAdmin && !isStudent && (
              <div className="flex items-center gap-2">
                <Link to="/" className={navLinkClass('/')}>Home</Link>
                <a href="#elections" className={navLinkClass('#elections')}>Elections</a>
                <a href="#platform" className={navLinkClass('#platform')}>Platform</a>
              </div>
            )}
            
            {/* Actions */}
            {!isAdmin && !isStudent && (
              <div className="flex items-center gap-4 pl-6 border-l border-surface-200">
                <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="px-4 py-2 text-sm font-medium bg-surface-50 hover:bg-surface-100 text-surface-900 border border-surface-200 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-surface-500" /> Admin
                </Link>
              </div>
            )}

            {isStudent && (
              <>
                <div className="flex items-center gap-2">
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                    <span className="flex items-center gap-1.5"><Home className="w-4 h-4" /> Dashboard</span>
                  </Link>
                  <Link to="/live" className={navLinkClass('/live')}>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live</span>
                  </Link>
                </div>
                <div className="flex items-center gap-4 pl-6 border-l border-surface-200">
                  <span className="text-sm text-surface-900 font-medium">{student?.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-surface-500 hover:text-danger-600 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </>
            )}
            {isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Dashboard</span>
                  </Link>
                  <Link to="/admin/elections" className={navLinkClass('/admin/elections')}>Elections</Link>
                  <Link to="/admin/voters" className={navLinkClass('/admin/voters')}>Voters</Link>
                  <Link to="/admin/audit" className={navLinkClass('/admin/audit')}>Audit</Link>
                </div>
                <div className="flex items-center gap-4 pl-6 border-l border-surface-200">
                  <span className="text-sm text-surface-900 flex items-center gap-2 font-medium">
                    <Shield className="w-3.5 h-3.5 text-surface-500" /> {admin?.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-surface-500 hover:text-danger-600 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-surface-600 hover:bg-surface-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white border-t border-surface-200"
          >
            <div className="px-6 py-4 space-y-1">
              {!isAdmin && !isStudent && (
                <>
                  <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Home</Link>
                  <a href="#elections" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Elections</a>
                  <a href="#platform" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Platform</a>
                  <div className="border-t border-surface-100 mt-3 pt-3 space-y-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full py-2.5 text-sm text-surface-900 font-medium">Student Login</Link>
                    <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="block w-full py-2.5 text-sm text-surface-600 font-medium flex items-center gap-2"><Shield className="w-4 h-4" /> Admin Login</Link>
                  </div>
                </>
              )}
              {isStudent && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Dashboard</Link>
                  <Link to="/live" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live</Link>
                  <div className="border-t border-surface-100 mt-3 pt-3">
                    <button onClick={handleLogout} className="block w-full text-left py-2.5 text-sm text-danger-600 font-medium flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
                  </div>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Dashboard</Link>
                  <Link to="/admin/elections" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Elections</Link>
                  <Link to="/admin/voters" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Voters</Link>
                  <Link to="/admin/audit" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-surface-600 hover:text-surface-900 font-medium">Audit</Link>
                  <div className="border-t border-surface-100 mt-3 pt-3">
                    <button onClick={handleLogout} className="block w-full text-left py-2.5 text-sm text-danger-600 font-medium flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
