import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, Vote, BarChart3, Clock, Activity, TrendingUp, Zap, Globe } from 'lucide-react';
import { getElections, getResults, getElectionAnalytics } from '../lib/api';
import { getSocket } from '../lib/socket';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityEvent { message: string; timestamp: Date; type: 'vote' | 'milestone' | 'info'; }

const LiveMonitor: React.FC = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getElections();
        const active = data.filter((e: any) => e.status === 'active');
        setElections(active);
        if (active.length > 0 && !selectedElection) setSelectedElection(active[0]);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    const load = async () => {
      try {
        const [rRes, aRes] = await Promise.all([getResults(selectedElection._id), getElectionAnalytics(selectedElection._id)]);
        setResults(rRes.data);
        setAnalytics(aRes.data);
      } catch {}
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [selectedElection]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('vote:cast', (data: any) => {
      const event: ActivityEvent = {
        message: `A student from ${data.faculty} just voted`,
        timestamp: new Date(data.timestamp),
        type: 'vote' as const,
      };
      setActivityFeed(prev => [event, ...prev].slice(0, 50));
      if (selectedElection && data.electionId === selectedElection._id) {
        getResults(selectedElection._id).then(({ data }) => setResults(data)).catch(() => {});
      }
    });
    return () => { socket.off('vote:cast'); };
  }, [selectedElection]);

  const getCountdown = (endDate: string) => {
    const diff = new Date(endDate).getTime() - now.getTime();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-5">
            <Radio className="w-10 h-10 text-surface-700" />
          </div>
          <h2 className="text-xl font-semibold text-surface-400">No Active Elections</h2>
          <p className="text-surface-500 mt-2">The live monitor activates when an election is running.</p>
        </div>
      </div>
    );
  }

  const countdown = selectedElection ? getCountdown(selectedElection.endDate) : null;
  const turnout = results?.turnout;
  const facultyTurnout = results?.facultyTurnout || [];

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Live Header Bar */}
      <div className="navbar-solid sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/15">
              <span className="live-dot" />
              <span className="text-red-400 text-sm font-bold tracking-wider">LIVE</span>
            </div>
            <h1 className="text-base font-display font-bold text-white hidden md:block">{selectedElection?.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-surface-400 text-sm flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4" /> {now.toLocaleTimeString()}
            </div>
            {results?.election?.resultsVisibility === 'live' && (
              <span className="badge badge-scheduled">Live Results</span>
            )}
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Countdown */}
        {countdown && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {[
                { val: countdown.d, label: 'Days' },
                { val: countdown.h, label: 'Hours' },
                { val: countdown.m, label: 'Minutes' },
                { val: countdown.s, label: 'Seconds' },
              ].map(t => (
                <div key={t.label} className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 glass rounded-2xl flex items-center justify-center mb-2">
                    <span className="text-3xl sm:text-4xl font-display font-bold text-white">{String(t.val).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[0.65rem] text-surface-500 uppercase tracking-widest font-semibold">{t.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Votes', value: turnout?.totalVotes || 0, icon: Vote, color: 'text-primary-400' },
            { label: 'Participation', value: `${turnout?.participationRate || 0}%`, icon: TrendingUp, color: 'text-accent-400' },
            { label: 'Eligible Voters', value: turnout?.totalEligible || 0, icon: Users, color: 'text-blue-400' },
            { label: 'Yet to Vote', value: (turnout?.totalEligible || 0) - (turnout?.totalVotes || 0), icon: Activity, color: 'text-amber-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card card p-5"
            >
              <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
              <p className="text-2xl md:text-3xl font-display font-bold text-white">{s.value}</p>
              <p className="text-xs text-surface-500 mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Faculty Turnout Chart */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" /> Faculty Turnout
            </h2>
            {facultyTurnout.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={facultyTurnout.map((f: any) => ({ name: f._id?.length > 12 ? f._id.slice(0, 12) + '...' : f._id, votes: f.count }))}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="votes" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-surface-500">No data yet</div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Live Activity
            </h2>
            <div ref={feedRef} className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              <AnimatePresence>
                {activityFeed.length > 0 ? activityFeed.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        event.type === 'vote' ? 'bg-accent-400 shadow-sm shadow-accent-400/50' :
                        event.type === 'milestone' ? 'bg-amber-400' : 'bg-primary-400'
                      }`} />
                      <div>
                        <p className="text-sm text-surface-300">{event.message}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12">
                    <Activity className="w-8 h-8 text-surface-700 mx-auto mb-3" />
                    <p className="text-sm text-surface-500">Waiting for activity...</p>
                    <p className="text-xs text-surface-600 mt-1">Events appear here in real-time</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Faculty Leaderboard */}
        {facultyTurnout.length > 0 && (
          <div className="mt-6 card p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-400" /> Faculty Participation Leaderboard
            </h2>
            <div className="space-y-3">
              {[...facultyTurnout].sort((a: any, b: any) => b.count - a.count).map((f: any, i: number) => {
                const pct = turnout?.totalVotes > 0 ? ((f.count / turnout.totalVotes) * 100).toFixed(1) : '0';
                return (
                  <div key={f._id} className="flex items-center gap-4">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-amber-500/15 text-amber-400' :
                      i === 1 ? 'bg-surface-700 text-surface-300' :
                      i === 2 ? 'bg-amber-800/15 text-amber-600' : 'bg-surface-800 text-surface-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white font-medium">{f._id}</span>
                        <span className="text-sm text-surface-400">{f.count} votes ({pct}%)</span>
                      </div>
                      <div className="progress-bar" style={{ height: '5px' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1 }}
                          className="progress-fill"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Results */}
        {results?.showResults && results.positions && (
          <div className="mt-6">
            <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2.5">
              <span className="live-dot" /> Live Results
            </h2>
            {Object.entries(results.positions).map(([pos, cands]: [string, any]) => {
              const sorted = [...cands].sort((a: any, b: any) => b.voteCount - a.voteCount);
              return (
                <div key={pos} className="mb-6 card p-6">
                  <h3 className="font-semibold text-white mb-4">{pos}</h3>
                  <div className="space-y-3">
                    {sorted.map((c: any, i: number) => (
                      <div key={c.id} className="flex items-center gap-4">
                        <span className={`text-lg font-display font-bold ${i === 0 ? 'text-amber-400' : 'text-surface-500'}`}>#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-white font-medium">{c.fullName}</span>
                            <span className="text-primary-400 font-bold">{c.voteCount} ({c.percentage}%)</span>
                          </div>
                          <div className="progress-bar" style={{ height: '8px' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.percentage}%` }}
                              transition={{ duration: 1.5, type: 'spring' }}
                              className="h-full rounded-full"
                              style={{ background: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'][i % 4] }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitor;
