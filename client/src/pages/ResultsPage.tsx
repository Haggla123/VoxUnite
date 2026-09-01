import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Users, BarChart3, Award, TrendingUp } from 'lucide-react';
import { getResults } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getResults(id).then(({ data }) => setResults(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-surface-50 pt-20 text-center text-surface-900">Results not available</div>
    );
  }

  const { election, turnout, facultyTurnout, positions, showResults } = results;

  return (
    <div className="page-wrapper bg-surface-50">
      <div className="page-container">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 mb-6 text-sm transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm mb-5">
            <BarChart3 className="w-4 h-4" /> Election Results
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-3 tracking-tight">{election.title}</h1>
          <span className={`badge ${election.status === 'closed' ? 'badge-closed' : 'badge-active'}`}>{election.status}</span>
        </motion.div>

        {/* Turnout stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Users, color: 'text-primary-600', value: turnout.totalEligible, label: 'Eligible Voters' },
            { icon: TrendingUp, color: 'text-accent-600', value: turnout.totalVotes, label: 'Votes Cast' },
            { icon: BarChart3, color: 'text-amber-600', value: `${turnout.participationRate}%`, label: 'Participation Rate' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card card p-6 text-center"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <p className={`text-3xl font-display font-bold ${i === 0 ? 'text-surface-900' : stat.color}`}>{stat.value}</p>
              <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Faculty Turnout Chart */}
        {facultyTurnout?.length > 0 && (
          <div className="card p-6 mb-12">
            <h2 className="text-lg font-semibold text-surface-900 mb-6">Faculty Turnout</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={facultyTurnout.map((f: any) => ({ name: f._id, votes: f.count }))}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                <Bar dataKey="votes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Results by Position */}
        {showResults && positions && Object.entries(positions).map(([position, cands], pIdx) => {
          const sorted = (cands as any[]).sort((a, b) => b.voteCount - a.voteCount);
          const totalPositionVotes = sorted.reduce((sum, c) => sum + c.voteCount, 0);

          return (
            <motion.div
              key={position}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pIdx * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-xl font-display font-bold text-surface-900 mb-6 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-primary-600" />{position}
              </h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="card p-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sorted.map(c => ({ name: c.fullName, value: c.voteCount }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                      >
                        {sorted.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate results */}
                <div className="space-y-3">
                  {sorted.map((c: any, i: number) => (
                    <div key={c.id} className={`p-4 rounded-xl border ${i === 0 ? 'bg-primary-50 border-primary-100' : 'card'}`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                          {i === 0 && <Trophy className="w-5 h-5 text-amber-600" />}
                          <span className={`font-semibold ${i === 0 ? 'text-surface-900' : 'text-surface-600'}`}>{c.fullName}</span>
                        </div>
                        <span className="font-display font-bold text-surface-900">
                          {c.voteCount} <span className="text-surface-400 text-sm">({c.percentage}%)</span>
                        </span>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${totalPositionVotes > 0 ? (c.voteCount / totalPositionVotes) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}

        {!showResults && (
          <div className="text-center py-16 card">
            <BarChart3 className="w-16 h-16 text-surface-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-surface-900">Results Not Available Yet</h3>
            <p className="text-surface-500 mt-2">Results will be visible when the election closes or admin enables live mode.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
