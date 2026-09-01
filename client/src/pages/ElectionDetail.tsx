import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Vote, Plus, Trash2, User, Play, Square, Eye, EyeOff } from 'lucide-react';
import { getElection, getCandidates, createCandidate, deleteCandidate, activateElection, closeElection, setResultsMode } from '../lib/api';
import toast from 'react-hot-toast';

const ElectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', position: '', slogan: '', manifesto: '', faculty: '', department: '' });

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [eRes, cRes] = await Promise.all([getElection(id), getCandidates(id)]);
      setElection(eRes.data);
      setCandidates(cRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries({ ...candidateForm, electionId: id! }).forEach(([k, v]) => formData.append(k, v));
    try {
      await createCandidate(formData);
      toast.success('Candidate added!');
      setCandidateForm({ fullName: '', position: '', slogan: '', manifesto: '', faculty: '', department: '' });
      setShowAddCandidate(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteCandidate = async (cId: string) => {
    if (!confirm('Delete this candidate?')) return;
    try { await deleteCandidate(cId); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const handleActivate = async () => { try { await activateElection(id!); toast.success('Activated!'); load(); } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } };
  const handleClose = async () => { try { await closeElection(id!); toast.success('Closed!'); load(); } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } };
  const handleResultsMode = async (mode: string) => { try { await setResultsMode(id!, mode); toast.success(`Mode: ${mode}`); load(); } catch { toast.error('Failed'); } };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!election) {
    return <div className="min-h-screen bg-surface-50 pt-20 text-center text-surface-900">Not found</div>;
  }

  const positions = election.positions || [];
  const grouped = positions.reduce((acc: any, pos: any) => {
    acc[pos.title] = candidates.filter(c => c.position === pos.title);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="page-wrapper bg-surface-50">
      <div className="page-container">
        <Link to="/admin/elections" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 mb-6 text-sm transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Elections
        </Link>

        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-surface-900 tracking-tight">{election.title}</h1>
              <p className="text-surface-500 mt-1.5">{election.description}</p>
              <div className="flex gap-4 mt-3 text-sm text-surface-400">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{election.totalEligibleVoters} eligible</span>
                <span className="flex items-center gap-1.5"><Vote className="w-4 h-4" />{election.totalVotesCast} votes</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {(election.status === 'draft' || election.status === 'scheduled') && (
                <button onClick={handleActivate} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-all">
                  <Play className="w-4 h-4" /> Activate
                </button>
              )}
              {election.status === 'active' && (
                <>
                  <button onClick={handleClose} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-all">
                    <Square className="w-4 h-4" /> Close
                  </button>
                  <button
                    onClick={() => handleResultsMode(election.resultsVisibility === 'safe' ? 'live' : 'safe')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl text-sm border border-surface-200 font-medium transition-all"
                  >
                    {election.resultsVisibility === 'safe'
                      ? <><Eye className="w-4 h-4" /> Enable Live Results</>
                      : <><EyeOff className="w-4 h-4" /> Safe Mode</>
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-surface-900">Candidates</h2>
          <button
            onClick={() => setShowAddCandidate(!showAddCandidate)}
            className="btn-primary px-4 py-2 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>

        {showAddCandidate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 card p-6 overflow-hidden">
            <form onSubmit={handleAddCandidate} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" value={candidateForm.fullName} onChange={e => setCandidateForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Full Name" required className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all" />
                <select value={candidateForm.position} onChange={e => setCandidateForm(f => ({ ...f, position: e.target.value }))} required className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all">
                  <option value="">Select Position</option>
                  {positions.map((p: any) => <option key={p.title} value={p.title}>{p.title}</option>)}
                </select>
              </div>
              <input type="text" value={candidateForm.slogan} onChange={e => setCandidateForm(f => ({ ...f, slogan: e.target.value }))} placeholder="Campaign Slogan" className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all" />
              <textarea value={candidateForm.manifesto} onChange={e => setCandidateForm(f => ({ ...f, manifesto: e.target.value }))} placeholder="Manifesto" rows={3} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all resize-none" />
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" value={candidateForm.faculty} onChange={e => setCandidateForm(f => ({ ...f, faculty: e.target.value }))} placeholder="Faculty" className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all" />
                <input type="text" value={candidateForm.department} onChange={e => setCandidateForm(f => ({ ...f, department: e.target.value }))} placeholder="Department" className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-sm">Add</button>
                <button type="button" onClick={() => setShowAddCandidate(false)} className="btn-secondary px-5 py-2 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {Object.entries(grouped).map(([position, cands]) => (
          <div key={position} className="mb-8">
            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" /> {position}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(cands as any[]).map(c => (
                <div key={c._id} className="card p-5 hover:border-surface-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {c.photo
                          ? <img src={c.photo} alt={c.fullName} className="w-full h-full rounded-xl object-cover" />
                          : <User className="w-6 h-6 text-surface-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-surface-900 truncate">{c.fullName}</p>
                        <p className="text-xs text-primary-600 truncate">{c.slogan}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCandidate(c._id)} className="p-2 text-surface-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {election.status === 'closed' && (
                    <div className="mt-3 pt-3 border-t border-surface-200">
                      <p className="text-sm text-surface-500">{c.voteCount} votes</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionDetail;
