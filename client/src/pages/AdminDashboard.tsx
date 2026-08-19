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
  initial: { opacity: 0, y: 20 },
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
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Voters', value: analytics?.totalVoters || 0, icon: Users, gradient: 'from-blue-500 to-blue-700' },
    { label: 'Votes Cast', value: analytics?.totalVotes || 0, icon: Vote, gradient: 'from-primary-500 to-primary-700' },
    { label: 'Participation', value: `${analytics?.participationRate || 0}%`, icon: BarChart3, gradient: 'from-accent-500 to-accent-700' },
    { label: 'Active Elections', value: analytics?.activeElections || 0, icon: Activity, gradient: 'from-amber-500 to-amber-700' },
  ];

  return (
    <div className="page-wrapper bg-surface-950">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 page-header">
          <div>
            <h1 className="page-title text-3xl sm:text-4xl">Admin <span className="gradient-text">Dashboard</span></h1>
            <p className="page-subtitle">Election management control center</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/voters" className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
              <Upload className="w-4 h-4" /> Import Voters
            </Link>
            <Link to="/admin/elections" className="btn-primary px-5 py-2.5 rounded-xl text-sm">
              <Plus className="w-4 h-4" /> New Election
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={staggerItem} className="stat-card card p-6">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-sm text-surface-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Elections list */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Elections</h2>
              <Link to="/admin/elections" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {elections.slice(0, 5).map(el => (
                <Link
                  key={el._id}
                  to={`/admin/elections/${el._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      el.status === 'active' ? 'bg-green-400 shadow-sm shadow-green-400/50' :
                      el.status === 'closed' ? 'bg-surface-500' : 'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{el.title}</p>
                      <p className="text-xs text-surface-500">{el.totalVotesCast} votes · <span className="capitalize">{el.status}</span></p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors" />
                </Link>
              ))}
              {elections.length === 0 && (
                <p className="text-surface-500 text-sm text-center py-8">No elections created yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link to="/admin/audit" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition-colors">
                All Logs <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {analytics?.recentActivity?.slice(0, 8).map((log: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    log.action.includes('VOTE') ? 'bg-accent-500/10 text-accent-400' :
                    log.action.includes('ADMIN') ? 'bg-primary-500/10 text-primary-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {log.action.includes('VOTE') ? <Vote className="w-4 h-4" /> :
                     log.action.includes('ADMIN') ? <Shield className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-surface-300 truncate">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-surface-500 truncate">{log.performedBy} · {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                <p className="text-surface-500 text-sm text-center py-4">No recent activity</p>
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
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Manage Elections', icon: Vote, to: '/admin/elections', gradient: 'from-primary-600 to-primary-800' },
            { label: 'Import Voters', icon: Upload, to: '/admin/voters', gradient: 'from-accent-600 to-accent-800' },
            { label: 'Audit Logs', icon: FileText, to: '/admin/audit', gradient: 'from-amber-600 to-amber-800' },
            { label: 'Live Monitor', icon: Activity, to: '/live', gradient: 'from-red-600 to-red-800' },
          ].map(a => (
            <motion.div key={a.label} variants={staggerItem}>
              <Link to={a.to} className="group block p-5 card card-interactive">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{a.label}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
