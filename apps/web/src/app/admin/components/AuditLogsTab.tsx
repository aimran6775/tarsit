'use client';

import { 
  History, User, Building2, Shield, Settings, Trash2,
  Search, ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import type { AuditLogsResponse } from '../types';

interface AuditLogsTabProps {
  auditLogsData: AuditLogsResponse | null;
  auditSearch: string;
  setAuditSearch: (search: string) => void;
  auditActionFilter: string;
  setAuditActionFilter: (action: string) => void;
  auditPage: number;
  setAuditPage: (page: number) => void;
}

const getActionIcon = (action: string) => {
  if (action.includes('user')) return User;
  if (action.includes('business')) return Building2;
  if (action.includes('verification')) return Shield;
  if (action.includes('setting')) return Settings;
  if (action.includes('delete')) return Trash2;
  return History;
};

const getActionColor = (action: string) => {
  if (action.includes('create')) return 'bg-emerald-500/20 text-emerald-400';
  if (action.includes('update')) return 'bg-blue-500/20 text-blue-400';
  if (action.includes('delete')) return 'bg-red-500/20 text-red-400';
  if (action.includes('approve')) return 'bg-emerald-500/20 text-emerald-400';
  if (action.includes('reject')) return 'bg-red-500/20 text-red-400';
  if (action.includes('suspend')) return 'bg-amber-500/20 text-amber-400';
  return 'bg-white/10 text-white/70';
};

export function AuditLogsTab({
  auditLogsData,
  auditSearch,
  setAuditSearch,
  auditActionFilter,
  setAuditActionFilter,
  auditPage,
  setAuditPage,
}: AuditLogsTabProps) {
  const logs = auditLogsData?.logs || [];
  const pagination = auditLogsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{pagination?.total || 0}</p>
          <p className="text-sm text-white/50">Total Actions</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {logs.filter(l => l.action.includes('create')).length}
          </p>
          <p className="text-sm text-white/50">Create Actions</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">
            {logs.filter(l => l.action.includes('update')).length}
          </p>
          <p className="text-sm text-white/50">Update Actions</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-red-400">
            {logs.filter(l => l.action.includes('delete')).length}
          </p>
          <p className="text-sm text-white/50">Delete Actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search logs..."
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <select
          value={auditActionFilter}
          onChange={(e) => setAuditActionFilter(e.target.value)}
          className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="" className="bg-neutral-900">All Actions</option>
          <option value="create" className="bg-neutral-900">Create</option>
          <option value="update" className="bg-neutral-900">Update</option>
          <option value="delete" className="bg-neutral-900">Delete</option>
          <option value="approve" className="bg-neutral-900">Approve</option>
          <option value="reject" className="bg-neutral-900">Reject</option>
          <option value="suspend" className="bg-neutral-900">Suspend</option>
        </select>
        <button className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <History className="h-16 w-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-white/40">
                          {log.entity} • {log.entityId.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-2">
                        {log.admin.firstName} {log.admin.lastName} 
                        <span className="text-white/40"> ({log.admin.email})</span>
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-xs text-white/40 font-mono bg-white/5 rounded-lg p-2 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-white/40 whitespace-nowrap">
                      <p>{new Date(log.createdAt).toLocaleDateString()}</p>
                      <p>{new Date(log.createdAt).toLocaleTimeString()}</p>
                      {log.ipAddress && (
                        <p className="mt-1">IP: {log.ipAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
                disabled={auditPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white/70" />
              </button>
              <span className="px-3 py-1 text-sm text-white/70">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setAuditPage(Math.min(pagination.totalPages, auditPage + 1))}
                disabled={auditPage === pagination.totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white/70" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
