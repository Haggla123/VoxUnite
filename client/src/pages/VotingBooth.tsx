import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Loader2, Shield, User, BookOpen, Award } from 'lucide-react';
import { getElection, getCandidates, castVote, checkVoteStatus } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type Step = 'intro' | 'voting' | 'review' | 'confirm' | 'success';

const VotingBooth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student } = useAuth();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>('intro');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedManifesto, setExpandedManifesto] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [elRes, canRes, voteRes] = await Promise.all([getElection(id), getCandidates(id), checkVoteStatus(id)]);
        if (voteRes.data.hasVoted) { navigate('/dashboard'); return; }
        if (elRes.data.status !== 'active') { navigate('/dashboard'); return; }
        setElection(elRes.data);
        setCandidates(canRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  const positions = election?.positions?.sort((a: any, b: any) => a.order - b.order) || [];
  const currentPos = positions[currentPosition];
  const positionCandidates = candidates.filter((c: any) => c.position === currentPos?.title);

  const handleSelect = (candidateId: string) => {
    setSelections(prev => {
      if (prev[currentPos.title] === candidateId) {
        const next = { ...prev };
        delete next[currentPos.title];
        return next;
      }
      return { ...prev, [currentPos.title]: candidateId };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const voteSelections = Object.entries(selections).map(([position, candidateId]) => ({ position, candidateId }));
      await castVote({ electionId: id!, selections: voteSelections });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center text-white">
        Election not found
      </div>
    );
  }

  return (
    <div className="page-wrapper bg-surface-950">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">

          {/* ═══ INTRO ═══ */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 pulse-glow shadow-2xl shadow-primary-500/20">
                <Vote className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 tracking-tight">{election.title}</h1>
              <p className="text-surface-400 max-w-lg mx-auto mb-8 leading-relaxed">{election.description}</p>

              {election.rules?.length > 0 && (
                <div className="max-w-md mx-auto text-left mb-8 card p-6">
                  <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-400" /> Election Rules
                  </h3>
                  <ul className="space-y-2.5">
                    {election.rules.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-surface-400 flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-accent-400 mt-0.5 shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-sm text-surface-500 mb-8">
                You will vote for {positions.length} position{positions.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setStep('voting')}
                className="btn-primary text-lg px-10 py-4 rounded-2xl"
              >
                Begin Voting <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ═══ VOTING ═══ */}
          {step === 'voting' && currentPos && (
            <motion.div
              key={`vote-${currentPosition}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.35 }}
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-surface-500 mb-2">
                  <span className="font-medium">Position {currentPosition + 1} of {positions.length}</span>
                  <span>{Math.round(((currentPosition + 1) / positions.length) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((currentPosition + 1) / positions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">{currentPos.title}</h2>
              <p className="text-surface-400 mb-8">Select your preferred candidate</p>

              <div className="grid gap-4">
                {positionCandidates.map((c: any) => {
                  const isSelected = selections[currentPos.title] === c._id;
                  return (
                    <motion.div
                      key={c._id}
                      whileHover={{ scale: 1.008 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => handleSelect(c._id)}
                      className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/[0.04] shadow-lg shadow-primary-500/10'
                          : 'border-white/5 bg-surface-900/50 hover:border-white/10'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isSelected ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25' : 'bg-surface-800'
                          }`}>
                            {c.photo
                              ? <img src={c.photo} alt={c.fullName} className="w-full h-full rounded-xl object-cover" />
                              : <User className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-surface-500'}`} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white">{c.fullName}</h3>
                            <p className="text-sm text-primary-400 mb-1">{c.slogan}</p>
                            <p className="text-xs text-surface-500">{c.faculty} · {c.department}</p>
                          </div>
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isSelected ? 'border-primary-500 bg-primary-500 shadow-md shadow-primary-500/30' : 'border-surface-600'
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        {c.manifesto && (
                          <div className="mt-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedManifesto(expandedManifesto === c._id ? null : c._id); }}
                              className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> {expandedManifesto === c._id ? 'Hide' : 'Read'} Manifesto
                            </button>
                            <AnimatePresence>
                              {expandedManifesto === c._id && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="text-sm text-surface-400 mt-3 leading-relaxed overflow-hidden"
                                >
                                  {c.manifesto}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => currentPosition > 0 ? setCurrentPosition(currentPosition - 1) : setStep('intro')}
                  className="btn-secondary px-6 py-3 rounded-xl text-sm"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={() => currentPosition < positions.length - 1 ? setCurrentPosition(currentPosition + 1) : setStep('review')}
                  className="btn-primary px-6 py-3 rounded-xl text-sm"
                >
                  {currentPosition < positions.length - 1
                    ? <>Next <ChevronRight className="w-5 h-5" /></>
                    : <>Review Ballot <ChevronRight className="w-5 h-5" /></>
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ REVIEW ═══ */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="py-8"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2 text-center tracking-tight">Review Your Ballot</h2>
              <p className="text-surface-400 text-center mb-8">Please review your selections before submitting</p>

              <div className="max-w-lg mx-auto space-y-3 mb-8">
                {positions.map((pos: any) => {
                  const selected = candidates.find((c: any) => c._id === selections[pos.title]);
                  return (
                    <div key={pos.title} className="p-5 card">
                      <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-2">{pos.title}</p>
                      {selected ? (
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-primary-400" />
                          <span className="font-semibold text-white">{selected.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-surface-500 italic text-sm">No selection</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="max-w-lg mx-auto mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-300 text-sm flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => { setStep('voting'); setCurrentPosition(positions.length - 1); }}
                  className="btn-secondary px-6 py-3 rounded-xl"
                >
                  Edit Selections
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="btn-primary px-8 py-3 rounded-xl"
                >
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ CONFIRM ═══ */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-12 text-center"
            >
              <div className="max-w-md mx-auto card p-8 border-amber-500/15">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl font-display font-bold text-white mb-3 tracking-tight">Final Confirmation</h2>
                <p className="text-surface-400 text-sm mb-6 leading-relaxed">
                  This action is <strong className="text-amber-400">irreversible</strong>. Once submitted, your vote cannot be changed or withdrawn.
                </p>
                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-300 text-sm">{error}</div>
                )}
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setStep('review')} className="btn-secondary px-6 py-3 rounded-xl">Go Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary px-8 py-3 rounded-xl"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Vote className="w-5 h-5" /> Submit Vote</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ SUCCESS ═══ */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <div className="w-24 h-24 rounded-full bg-accent-500/15 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent-500/10">
                  <CheckCircle className="w-12 h-12 text-accent-400" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">Vote Submitted!</h2>
              <p className="text-surface-400 max-w-md mx-auto mb-8 leading-relaxed">
                Your vote has been securely recorded. Thank you for participating in this election.
              </p>

              {/* Receipt */}
              <div className="max-w-sm mx-auto card p-6 mb-8">
                <h3 className="text-xs text-surface-500 uppercase tracking-widest font-semibold mb-4">Vote Receipt</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-surface-400">Election</span><span className="text-white font-medium">{election.title}</span></div>
                  <div className="flex justify-between"><span className="text-surface-400">Voter</span><span className="text-white font-mono">{student?.studentId}</span></div>
                  <div className="flex justify-between"><span className="text-surface-400">Timestamp</span><span className="text-white">{new Date().toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-surface-400">Status</span><span className="text-accent-400 font-semibold">Confirmed ✓</span></div>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary px-8 py-3 rounded-xl"
              >
                Return to Dashboard <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default VotingBooth;
