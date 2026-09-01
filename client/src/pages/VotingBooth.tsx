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
  const missingSelections = positions.filter((pos: any) => !selections[pos.title]);
  const allPositionsSelected = positions.length > 0 && missingSelections.length === 0;

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
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center text-surface-500">
        Election not found
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="max-w-3xl mx-auto px-4">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                <Vote className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3 tracking-tight">{election.title}</h1>
              <p className="text-surface-500 max-w-lg mx-auto mb-6 leading-relaxed">{election.description}</p>

              {election.rules?.length > 0 && (
                <div className="max-w-md mx-auto text-left mb-6 card p-5">
                  <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-600" /> Election Rules
                  </h3>
                  <ul className="space-y-2">
                    {election.rules.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-surface-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-sm text-surface-400 mb-6">
                You will vote for {positions.length} position{positions.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setStep('voting')}
                className="btn-primary text-base px-8 py-3 rounded-lg"
              >
                Begin Voting <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* VOTING */}
          {step === 'voting' && currentPos && (
            <motion.div
              key={`vote-${currentPosition}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="mb-6">
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

              <h2 className="text-xl font-bold text-surface-900 mb-1 tracking-tight">{currentPos.title}</h2>
              <p className="text-surface-500 mb-6">Select your preferred candidate</p>

              <div className="grid gap-3">
                {positionCandidates.map((c: any) => {
                  const isSelected = selections[currentPos.title] === c._id;
                  return (
                    <motion.div
                      key={c._id}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => handleSelect(c._id)}
                      className={`relative cursor-pointer rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                          : 'border-surface-200 bg-white hover:border-surface-300'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-primary-100' : 'bg-surface-100'
                          }`}>
                            {c.photo
                              ? <img src={c.photo} alt={c.fullName} className="w-full h-full rounded-lg object-cover" />
                              : <User className={`w-7 h-7 ${isSelected ? 'text-primary-600' : 'text-surface-400'}`} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-surface-900">{c.fullName}</h3>
                            <p className="text-sm text-primary-600 mb-0.5">{c.slogan}</p>
                            <p className="text-xs text-surface-400">{c.faculty} · {c.department}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-primary-600 bg-primary-600' : 'border-surface-300'
                          }`}>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                        {c.manifesto && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedManifesto(expandedManifesto === c._id ? null : c._id); }}
                              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> {expandedManifesto === c._id ? 'Hide' : 'Read'} Manifesto
                            </button>
                            <AnimatePresence>
                              {expandedManifesto === c._id && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="text-sm text-surface-500 mt-2 leading-relaxed overflow-hidden"
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
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => currentPosition > 0 ? setCurrentPosition(currentPosition - 1) : setStep('intro')}
                  className="btn-secondary px-5 py-2.5 rounded-lg text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => currentPosition < positions.length - 1 ? setCurrentPosition(currentPosition + 1) : setStep('review')}
                  className="btn-primary px-5 py-2.5 rounded-lg text-sm"
                >
                  {currentPosition < positions.length - 1
                    ? <>Next <ChevronRight className="w-4 h-4" /></>
                    : <>Review Ballot <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* REVIEW */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6"
            >
              <h2 className="text-xl font-bold text-surface-900 mb-1 text-center tracking-tight">Review Your Ballot</h2>
              <p className="text-surface-500 text-center mb-6">Please review your selections before submitting</p>

              <div className="max-w-lg mx-auto space-y-2 mb-6">
                {positions.map((pos: any) => {
                  const selected = candidates.find((c: any) => c._id === selections[pos.title]);
                  return (
                    <div key={pos.title} className="p-4 card">
                      <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold mb-1.5">{pos.title}</p>
                      {selected ? (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary-600" />
                          <span className="font-medium text-surface-900">{selected.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-surface-400 italic text-sm">No selection</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {!allPositionsSelected && (
                <div className="max-w-lg mx-auto mb-4 p-3 rounded-lg bg-warning-50 border border-warning-100 text-warning-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Select a candidate for every position before submitting.
                </div>
              )}

              {error && (
                <div className="max-w-lg mx-auto mb-4 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setStep('voting'); setCurrentPosition(positions.length - 1); }}
                  className="btn-secondary px-5 py-2.5 rounded-lg"
                >
                  Edit Selections
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!allPositionsSelected}
                  className="btn-primary px-6 py-2.5 rounded-lg"
                >
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          )}

          {/* CONFIRM */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="py-10 text-center"
            >
              <div className="max-w-md mx-auto card p-7 border-warning-200">
                <AlertTriangle className="w-10 h-10 text-warning-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-surface-900 mb-2 tracking-tight">Final Confirmation</h2>
                <p className="text-surface-500 text-sm mb-5 leading-relaxed">
                  This action is <strong className="text-warning-600">irreversible</strong>. Once submitted, your vote cannot be changed or withdrawn.
                </p>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">{error}</div>
                )}
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setStep('review')} className="btn-secondary px-5 py-2.5 rounded-lg">Go Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary px-6 py-2.5 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Vote className="w-4 h-4" /> Submit Vote</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
              >
                <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-accent-500" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-surface-900 mb-3 tracking-tight">Vote Submitted!</h2>
              <p className="text-surface-500 max-w-md mx-auto mb-6 leading-relaxed">
                Your vote has been securely recorded. Thank you for participating in this election.
              </p>

              {/* Receipt */}
              <div className="max-w-sm mx-auto card p-5 mb-6">
                <h3 className="text-xs text-surface-400 uppercase tracking-widest font-semibold mb-3">Vote Receipt</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-surface-500">Election</span><span className="text-surface-900 font-medium">{election.title}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Voter</span><span className="text-surface-900 font-mono">{student?.studentId}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Timestamp</span><span className="text-surface-900">{new Date().toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Status</span><span className="text-accent-600 font-semibold">Confirmed ✓</span></div>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary px-6 py-2.5 rounded-lg"
              >
                Return to Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default VotingBooth;
