'use client';

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Mail,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';
import type { User as UserType, UsersResponse } from '../types';
import { getRoleColor } from '../types';

interface UsersTabProps {
  usersData: UsersResponse | null;
  userSearch: string;
  setUserSearch: (search: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (role: string) => void;
  userPage: number;
  setUserPage: (page: number) => void;
  onUserAction: (userId: string, action: 'suspend' | 'activate' | 'delete' | 'promote') => void;
  onViewUser: (user: UserType) => void;
}

export function UsersTab({
  usersData,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  userPage,
  setUserPage,
  onUserAction,
  onViewUser,
}: UsersTabProps) {
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{pagination?.total || 0}</p>
          <p className="text-sm text-white/50">Total Users</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {users.filter((u) => u.active).length}
          </p>
          <p className="text-sm text-white/50">Active Users</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">
            {users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
          </p>
          <p className="text-sm text-white/50">Admins</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">
            {users.filter((u) => u.role === 'BUSINESS_OWNER').length}
          </p>
          <p className="text-sm text-white/50">Business Owners</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
          />
        </div>
        <select
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="" className="bg-neutral-900">
            All Roles
          </option>
          <option value="SUPER_ADMIN" className="bg-neutral-900">
            Super Admin
          </option>
          <option value="ADMIN" className="bg-neutral-900">
            Admin
          </option>
          <option value="BUSINESS_OWNER" className="bg-neutral-900">
            Business Owner
          </option>
          <option value="CUSTOMER" className="bg-neutral-900">
            Customer
          </option>
        </select>
        <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-white/70">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-white/70">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-white/70">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-white/70">
                  Activity
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-white/70">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-white/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-xl"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {user.firstName?.charAt(0)?.toUpperCase() ||
                              user.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-white/50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`}
                      />
                      <span
                        className={`text-sm ${user.active ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {user.active ? 'Active' : 'Suspended'}
                      </span>
                      {user.verified && (
                        <span title="Verified">
                          <Shield className="h-4 w-4 text-blue-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-white/70">{user._count?.businesses || 0} businesses</p>
                      <p className="text-white/50">{user._count?.reviews || 0} reviews</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewUser(user)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="View User"
                      >
                        <Eye className="h-4 w-4 text-white/50 hover:text-white" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4 text-white/50 hover:text-white" />
                      </button>
                      {user.active ? (
                        <button
                          onClick={() => onUserAction(user.id, 'suspend')}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Suspend User"
                        >
                          <Ban className="h-4 w-4 text-red-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUserAction(user.id, 'activate')}
                          className="p-2 rounded-lg hover:bg-emerald-500/20 transition-colors"
                          title="Activate User"
                        >
                          <UserCheck className="h-4 w-4 text-emerald-400" />
                        </button>
                      )}
                      <button
                        onClick={() => onUserAction(user.id, 'delete')}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white/70" />
              </button>
              <span className="px-3 py-1 text-sm text-white/70">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setUserPage(Math.min(pagination.totalPages, userPage + 1))}
                disabled={userPage === pagination.totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white/70" />
              </button>
            </div>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
