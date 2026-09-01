import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Users, Vote, Activity, Shield, Plus, ChevronRight, Upload, FileText } from 'lucide-react';
import { getDashboardAnalytics, getElections } from '../lib/api';

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, eRes] = await Promise.all([getDashboardAnalytics(), getElections()]);
        setAnalytics(aRes.data);
        setElections(eRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Voters', value: analytics?.totalVoters || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Votes Cast', value: analytics?.totalVotes || 0, icon: Vote, color: 'bg-primary-50 text-primary-600' },
    { label: 'Participation', value: `${analytics?.participationRate || 0}%`, icon: BarChart3, color: 'bg-accent-50 text-accent-600' },
    { label: 'Active Elections', value: analytics?.activeElections || 0, icon: Activity, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 page-header">
          <div>
            <h1 className="page-title text-2xl">Admin Dashboard</h1>
            <p className="page-subtitle">Election management control center</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/voters" className="btn-secondary px-4 py-2 rounded-lg text-sm">
              <Upload className="w-4 h-4" /> Import Voters
            </Link>
            <Link to="/admin/elections" className="btn-primary px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New Election
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={staggerItem} className="stat-card p-5">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{s.value}</p>
              <p className="text-sm text-surface-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Elections list */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-surface-900">Elections</h2>
              <Link to="/admin/elections" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-1">
              {elections.slice(0, 5).map(el => (
                <Link
                  key={el._id}
                  to={`/admin/elections/${el._id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      el.status === 'active' ? 'bg-accent-500' :
                      el.status === 'closed' ? 'bg-surface-300' : 'bg-warning-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-surface-800 group-hover:text-primary-600 transition-colors">{el.title}</p>
                      <p className="text-xs text-surface-400">{el.totalVotesCast} votes · <span className="capitalize">{el.status}</span></p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-surface-500 transition-colors" />
                </Link>
              ))}
              {elections.length === 0 && (
                <p className="text-surface-400 text-sm text-center py-6">No elections created yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-surface-900">Recent Activity</h2>
              <Link to="/admin/audit" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium transition-colors">
                All Logs <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-1">
              {analytics?.recentActivity?.slice(0, 8).map((log: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    log.action.includes('VOTE') ? 'bg-accent-50 text-accent-600' :
                    log.action.includes('ADMIN') ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {log.action.includes('VOTE') ? <Vote className="w-4 h-4" /> :
                     log.action.includes('ADMIN') ? <Shield className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-surface-700 truncate">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-surface-400 truncate">{log.performedBy} · {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                <p className="text-surface-400 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Manage Elections', icon: Vote, to: '/admin/elections', color: 'bg-primary-50 text-primary-600' },
            { label: 'Import Voters', icon: Upload, to: '/admin/voters', color: 'bg-accent-50 text-accent-600' },
            { label: 'Audit Logs', icon: FileText, to: '/admin/audit', color: 'bg-amber-50 text-amber-600' },
            { label: 'Live Monitor', icon: Activity, to: '/live', color: 'bg-red-50 text-red-600' },
          ].map(a => (
            <motion.div key={a.label} variants={staggerItem}>
              <Link to={a.to} className="group block p-4 card card-interactive">
                <div className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center mb-3`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-surface-700 group-hover:text-primary-600 transition-colors">{a.label}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
