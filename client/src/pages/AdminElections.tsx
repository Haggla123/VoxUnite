import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Vote, ChevronRight, Clock, Users, Lock, Play, Square, Settings } from 'lucide-react';
import { getElections, createElection, activateElection, closeElection } from '../lib/api';
import toast from 'react-hot-toast';

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const AdminElections: React.FC = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', facultyScope: 'All',
    positions: [{ title: 'President', maxVotes: 1, order: 1 }],
  });

  const load = async () => { try { const { data } = await getElections(); setElections(data); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createElection({ ...form, facultyScope: [form.facultyScope], positions: form.positions });
      toast.success('Election created!');
      setShowCreate(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleActivate = async (id: string) => { try { await activateElection(id); toast.success('Election activated!'); load(); } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } };
  const handleClose = async (id: string) => { try { await closeElection(id); toast.success('Election closed!'); load(); } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); } };

  const addPosition = () => { setForm(f => ({ ...f, positions: [...f.positions, { title: '', maxVotes: 1, order: f.positions.length + 1 }] })); };
  const updatePosition = (i: number, key: string, val: any) => { setForm(f => ({ ...f, positions: f.positions.map((p, idx) => idx === i ? { ...p, [key]: val } : p) })); };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-wrapper bg-surface-50">
      <div className="page-container">
        <div className="flex items-center justify-between page-header">
          <h1 className="page-title text-3xl">Election <span className="gradient-text">Vault</span></h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> New Election
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 card p-6 overflow-hidden"
          >
            <h2 className="text-lg font-semibold text-surface-900 mb-5">Create Election</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-700 mb-1.5 font-medium">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-surface-700 mb-1.5 font-medium">Faculty Scope</label>
                  <input type="text" value={form.facultyScope} onChange={e => setForm(f => ({ ...f, facultyScope: e.target.value }))} className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-surface-700 mb-1.5 font-medium">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={2} className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-700 mb-1.5 font-medium">Start Date</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-surface-700 mb-1.5 font-medium">End Date</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-surface-700 font-medium">Positions</label>
                  <button type="button" onClick={addPosition} className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">+ Add Position</button>
                </div>
                <div className="space-y-2">
                  {form.positions.map((p, i) => (
                    <input key={i} type="text" value={p.title} onChange={e => updatePosition(i, 'title', e.target.value)} placeholder="Position title" className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:border-primary-500 transition-all" />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Create Election</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary px-6 py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Elections List */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {elections.map((el) => (
            <motion.div key={el._id} variants={staggerItem} className="card p-6 hover:border-surface-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-surface-900 truncate">{el.title}</h3>
                    <span className={`badge badge-${el.status} shrink-0`}>{el.status}</span>
                  </div>
                  <p className="text-sm text-surface-500 line-clamp-1">{el.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(el.startDate).toLocaleDateString()} - {new Date(el.endDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {el.totalVotesCast}/{el.totalEligibleVoters} votes</span>
                    <span className="flex items-center gap-1.5"><Vote className="w-3.5 h-3.5" /> {el.positions?.length || 0} positions</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(el.status === 'draft' || el.status === 'scheduled') && (
                    <button onClick={() => handleActivate(el._id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm transition-all font-medium">
                      <Play className="w-4 h-4" /> Activate
                    </button>
                  )}
                  {el.status === 'active' && (
                    <button onClick={() => handleClose(el._id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm transition-all font-medium">
                      <Square className="w-4 h-4" /> Close
                    </button>
                  )}
                  <Link to={`/admin/elections/${el._id}`} className="flex items-center gap-1.5 px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl text-sm border border-surface-200 transition-all font-medium">
                    <Settings className="w-4 h-4" /> Manage
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminElections;
