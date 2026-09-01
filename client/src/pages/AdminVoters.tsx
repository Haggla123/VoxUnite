import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadVoters, getVoters, getVoterStats } from '../lib/api';
import toast from 'react-hot-toast';

const AdminVoters: React.FC = () => {
  const [voters, setVoters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const [vRes, sRes] = await Promise.all([getVoters({ page, search }), getVoterStats()]);
      setVoters(vRes.data.voters);
      setPagination(vRes.data.pagination);
      setStats(sRes.data);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadResult(null);
    const formData = new FormData();
    formData.append('voterFile', file);
    try {
      const { data } = await uploadVoters(formData);
      setUploadResult(data.stats);
      toast.success(`Imported ${data.stats.inserted} voters!`);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Upload failed'); }
    setUploading(false);
  };

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
        <h1 className="page-title text-3xl mb-8">Voter <span className="gradient-text">Management</span></h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { value: stats.total, label: 'Total Voters', color: 'text-surface-900' },
              { value: stats.voted, label: 'Have Voted', color: 'text-accent-600' },
              { value: stats.notVoted, label: 'Not Voted', color: 'text-amber-600' },
              { value: `${stats.participationRate}%`, label: 'Participation', color: 'text-primary-600' },
            ].map(s => (
              <div key={s.label} className="stat-card card p-5">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-surface-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-primary-600" /> Import Voters
          </h2>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-surface-200 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 group">
            <FileSpreadsheet className="w-8 h-8 text-surface-400 mb-2 group-hover:text-primary-600 transition-colors" />
            <span className="text-sm text-surface-500 group-hover:text-surface-700 transition-colors">
              {uploading ? 'Uploading...' : 'Drop CSV/XLSX file here or click to upload'}
            </span>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>

          {uploadResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 rounded-xl bg-accent-50 border border-accent-100">
              <div className="flex items-center gap-2 text-accent-600 font-semibold mb-3 text-sm">
                <CheckCircle className="w-5 h-5" /> Import Complete
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-surface-500">Total Rows:</span> <span className="text-surface-900 font-medium">{uploadResult.totalRows}</span></div>
                <div><span className="text-surface-500">Valid:</span> <span className="text-surface-900 font-medium">{uploadResult.validRecords}</span></div>
                <div><span className="text-surface-500">Inserted:</span> <span className="text-accent-600 font-medium">{uploadResult.inserted}</span></div>
                <div><span className="text-surface-500">Duplicates:</span> <span className="text-amber-600 font-medium">{uploadResult.duplicates}</span></div>
              </div>
              {uploadResult.parseErrors?.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1 text-red-600 text-xs mb-1"><AlertCircle className="w-3 h-3" /> Parse Errors:</div>
                  {uploadResult.parseErrors.slice(0, 5).map((e: string, i: number) => <p key={i} className="text-xs text-surface-500">{e}</p>)}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th className="hidden md:table-cell">Email</th>
                  <th className="hidden lg:table-cell">Faculty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {voters.map(v => (
                  <tr key={v._id}>
                    <td className="font-mono text-surface-900 text-sm">{v.studentId}</td>
                    <td className="text-surface-900">{v.fullName}</td>
                    <td className="text-surface-500 hidden md:table-cell">{v.email}</td>
                    <td className="text-surface-500 hidden lg:table-cell">{v.faculty}</td>
                    <td>
                      <span className={`badge ${v.hasVoted ? 'badge-active' : 'badge-closed'}`}>
                        {v.hasVoted ? 'Voted' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200">
              <p className="text-sm text-surface-500">Page {pagination.page} of {pagination.pages} ({pagination.total} voters)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-1.5 bg-surface-100 text-surface-700 rounded-lg text-sm disabled:opacity-40 hover:bg-surface-200 border border-surface-200 transition-all font-medium">Prev</button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-1.5 bg-surface-100 text-surface-700 rounded-lg text-sm disabled:opacity-40 hover:bg-surface-200 border border-surface-200 transition-all font-medium">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVoters;
