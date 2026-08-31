import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AdminRoute, AuthenticatedRoute, StudentRoute } from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import VotingBooth from './pages/VotingBooth';
import ResultsPage from './pages/ResultsPage';
import LiveMonitor from './pages/LiveMonitor';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminElections from './pages/AdminElections';
import ElectionDetail from './pages/ElectionDetail';
import AdminVoters from './pages/AdminVoters';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-surface-950">
          <Navbar />
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(16px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/live" element={<AuthenticatedRoute><LiveMonitor /></AuthenticatedRoute>} />
            <Route path="/results/:id" element={<ResultsPage />} />

            {/* Student Protected */}
            <Route path="/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
            <Route path="/vote/:id" element={<StudentRoute><VotingBooth /></StudentRoute>} />

            {/* Admin Protected */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/elections" element={<AdminRoute><AdminElections /></AdminRoute>} />
            <Route path="/admin/elections/:id" element={<AdminRoute><ElectionDetail /></AdminRoute>} />
            <Route path="/admin/voters" element={<AdminRoute><AdminVoters /></AdminRoute>} />
            <Route path="/admin/audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
