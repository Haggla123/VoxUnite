import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Vote, Clock, CheckCircle, Calendar, Users, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { getElections, checkVoteStatus } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const StudentDashboard: React.FC = () => {
  const { student } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getElections();
        setElections(data);
        const voteChecks: Record<string, boolean> = {};
        for (const el of data) {
          try { const { data: v } = await checkVoteStatus(el._id); voteChecks[el._id] = v.hasVoted; } catch { voteChecks[el._id] = false; }
        }
        setVotedMap(voteChecks);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  const getTimeRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h ${mins}m remaining`;
  };

  const active = elections.filter(e => e.status === 'active');
  const upcoming = elections.filter(e => e.status === 'scheduled' || e.status === 'draft');
  const closed = elections.filter(e => e.status === 'closed');

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-wrapper bg-surface-950">
      <div className="page-container">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title text-3xl sm:text-4xl">
            Welcome, <span className="gradient-text">{student?.fullName}</span>
          </h1>
          <p className="page-subtitle mt-2">
            {student?.faculty} · {student?.department} · <span className="font-mono text-surface-500">{student?.studentId}</span>
          </p>
        </motion.div>

        {/* Active Elections */}
        {active.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2.5">
              <span className="live-dot" /> Active Elections
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid md:grid-cols-2 gap-6"
            >
              {active.map((el) => (
                <motion.div key={el._id} variants={staggerItem} className="relative group">
                  {/* Hover glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative card p-6 hover:border-primary-500/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 mr-3">
                        <h3 className="text-lg font-semibold text-white">{el.title}</h3>
                        <p className="text-surface-400 text-sm mt-1 line-clamp-2">{el.description}</p>
                      </div>
                      <span className="badge badge-active shrink-0">{el.status}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-surface-500 mb-5">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {getTimeRemaining(el.endDate)}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {el.totalVotesCast} votes</span>
                    </div>

                    {/* Turnout */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                        <span>Turnout</span>
                        <span className="text-surface-300 font-medium">{el.totalEligibleVoters > 0 ? ((el.totalVotesCast / el.totalEligibleVoters) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${el.totalEligibleVoters > 0 ? (el.totalVotesCast / el.totalEligibleVoters) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {votedMap[el._id] ? (
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-accent-500/8 border border-accent-500/15 rounded-xl text-accent-400 text-sm font-medium">
                        <CheckCircle className="w-5 h-5" /> You have voted in this election
                      </div>
                    ) : (
                      <Link
                        to={`/vote/${el._id}`}
                        className="btn-primary w-full rounded-xl py-3"
                      >
                        <Vote className="w-5 h-5" /> Cast Your Vote <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-amber-400" /> Upcoming Elections
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(el => (
                <div key={el._id} className="card p-5">
                  <h3 className="font-semibold text-white mb-2">{el.title}</h3>
                  <p className="text-surface-400 text-sm line-clamp-2">{el.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 font-medium">
                    <Clock className="w-4 h-4" /> Starts {new Date(el.startDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Closed */}
        {closed.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-surface-500" /> Closed Elections
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closed.map(el => (
                <div key={el._id} className="card p-5">
                  <h3 className="font-semibold text-white mb-2">{el.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-surface-500 mt-2">
                    <span>{el.totalVotesCast} votes</span>
                    <span>Ended {new Date(el.endDate).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/results/${el._id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    View Results <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {elections.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-5">
              <Vote className="w-10 h-10 text-surface-700" />
            </div>
            <h3 className="text-xl font-semibold text-surface-400">No Elections Available</h3>
            <p className="text-surface-500 mt-2">Check back later for upcoming elections.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
