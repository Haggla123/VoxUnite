import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter } from 'lucide-react';
import { getAuditLogs } from '../lib/api';

const actionColors: Record<string, string> = {
  ADMIN_LOGIN: 'bg-primary-50 text-primary-600 border border-primary-100',
  OTP_REQUESTED: 'bg-blue-50 text-blue-600 border border-blue-100',
  OTP_VERIFIED: 'bg-green-50 text-green-600 border border-green-100',
  OTP_FAILED: 'bg-red-50 text-red-600 border border-red-100',
  VOTE_SUBMITTED: 'bg-accent-50 text-accent-700 border border-accent-100',
  ELECTION_CREATED: 'bg-purple-50 text-purple-600 border border-purple-100',
  ELECTION_ACTIVATED: 'bg-green-50 text-green-600 border border-green-100',
  ELECTION_CLOSED: 'bg-amber-50 text-amber-600 border border-amber-100',
  VOTERS_IMPORTED: 'bg-blue-50 text-blue-600 border border-blue-100',
  CANDIDATE_ADDED: 'bg-pink-50 text-pink-600 border border-pink-100',
};

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await getAuditLogs({ page, search, action: actionFilter || undefined });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  }, [page, search, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const actions = ['', 'ADMIN_LOGIN', 'OTP_REQUESTED', 'OTP_VERIFIED', 'OTP_FAILED', 'VOTE_SUBMITTED', 'ELECTION_CREATED', 'ELECTION_ACTIVATED', 'ELECTION_CLOSED', 'VOTERS_IMPORTED', 'CANDIDATE_ADDED'];

  return (
    <div className="page-wrapper bg-surface-50">
      <div className="page-container">
        <h1 className="page-title text-3xl mb-8 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-600" /> Audit <span className="gradient-text">Logs</span>
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search logs..."
              className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <select
              value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(1); }}
              className="pl-12 pr-8 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:border-primary-500 appearance-none min-w-[200px] transition-all"
            >
              <option value="">All Actions</option>
              {actions.filter(Boolean).map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th className="hidden md:table-cell">Role</th>
                  <th className="hidden lg:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr
                    key={log._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="text-surface-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${actionColors[log.action] || 'bg-surface-100 text-surface-600 border border-surface-200'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="text-surface-900">{log.performedBy}</td>
                    <td className="text-surface-500 hidden md:table-cell capitalize">{log.userRole}</td>
                    <td className="text-xs text-surface-400 hidden lg:table-cell max-w-xs truncate">{JSON.stringify(log.metadata)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200">
              <p className="text-sm text-surface-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-1.5 bg-surface-100 text-surface-700 rounded-lg text-sm disabled:opacity-40 hover:bg-surface-200 border border-surface-200 transition-all font-medium">Prev</button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-1.5 bg-surface-100 text-surface-700 rounded-lg text-sm disabled:opacity-40 hover:bg-surface-200 border border-surface-200 transition-all font-medium">Next</button>
              </div>
            </div>
          )}
          {logs.length === 0 && <div className="text-center py-12 text-surface-400">No audit logs found</div>}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
