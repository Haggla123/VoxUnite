import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Vote, BarChart3, LogOut, Menu, X, Home, Radio } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAdmin, isStudent, admin, student, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const navLinkClass = (path: string) =>
    `px-4 py-2 text-sm rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
      isActive(path)
        ? 'text-white bg-white/10 font-medium'
        : 'text-surface-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className={`fixed top-0 left-0 right-0 z-50 ${
          isLanding && !scrolled ? 'navbar-transparent' : 'navbar-solid'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Vox<span className="text-primary-400">Unite</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {!isAdmin && !isStudent && (
                <>
                  <Link to="/" className={navLinkClass('/')}>Home</Link>
                  <Link to="/login" className={navLinkClass('/login')}>Student Login</Link>
                  <Link to="/live" className={navLinkClass('/live')}>
                    <span className="live-dot" /> Live
                  </Link>
                  <Link
                    to="/admin/login"
                    className="ml-2 px-5 py-2 text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30"
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                </>
              )}
              {isStudent && (
                <>
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                    <Home className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/live" className={navLinkClass('/live')}>
                    <span className="live-dot" /> Live
                  </Link>
                  <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-3">
                    <span className="text-sm text-surface-300 font-medium">{student?.fullName}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                    <BarChart3 className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/admin/elections" className={navLinkClass('/admin/elections')}>Elections</Link>
                  <Link to="/admin/voters" className={navLinkClass('/admin/voters')}>Voters</Link>
                  <Link to="/admin/audit" className={navLinkClass('/admin/audit')}>Audit</Link>
                  <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-3">
                    <span className="text-sm text-primary-300 flex items-center gap-1.5 font-medium">
                      <Shield className="w-3.5 h-3.5" /> {admin?.fullName}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white rounded-xl hover:bg-white/5 transition-colors"
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
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
            >
              <div className="bg-surface-900/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 space-y-1">
                {!isAdmin && !isStudent && (
                  <>
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Home</Link>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Student Login</Link>
                    <Link to="/live" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"><span className="live-dot" /> Live Monitor</Link>
                    <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-primary-400 hover:text-primary-300 rounded-xl hover:bg-primary-500/10 transition-all flex items-center gap-2"><Shield className="w-4 h-4" /> Admin Login</Link>
                  </>
                )}
                {isStudent && (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Dashboard</Link>
                    <Link to="/live" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"><span className="live-dot" /> Live</Link>
                    <div className="border-t border-white/5 mt-2 pt-2">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-400 rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
                    </div>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Dashboard</Link>
                    <Link to="/admin/elections" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Elections</Link>
                    <Link to="/admin/voters" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Voters</Link>
                    <Link to="/admin/audit" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-surface-200 hover:text-white rounded-xl hover:bg-white/5 transition-all">Audit</Link>
                    <div className="border-t border-white/5 mt-2 pt-2">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-400 rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to offset fixed navbar on non-landing pages */}
      {!isLanding && <div className="h-16" />}
    </>
  );
};

export default Navbar;
