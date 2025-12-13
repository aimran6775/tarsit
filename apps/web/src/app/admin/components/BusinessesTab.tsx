'use client';

import Image from 'next/image';
import { 
  Search, Download, Eye, Ban, CheckCircle, Star, Trash2, 
  Building2, ChevronLeft, ChevronRight, ExternalLink, Edit,
  MapPin, Calendar, Sparkles
} from 'lucide-react';
import type { Business, BusinessesResponse } from '../types';
import { getStatusColor } from '../types';

interface BusinessesTabProps {
  businessesData: BusinessesResponse | null;
  businessSearch: string;
  setBusinessSearch: (search: string) => void;
  businessStatusFilter: string;
  setBusinessStatusFilter: (status: string) => void;
  businessPage: number;
  setBusinessPage: (page: number) => void;
  onBusinessAction: (businessId: string, action: 'verify' | 'suspend' | 'activate' | 'feature' | 'delete') => void;
  onViewBusiness: (business: Business) => void;
}

export function BusinessesTab({
  businessesData,
  businessSearch,
  setBusinessSearch,
  businessStatusFilter,
  setBusinessStatusFilter,
  businessPage,
  setBusinessPage,
  onBusinessAction,
  onViewBusiness,
}: BusinessesTabProps) {
  const businesses = businessesData?.businesses || [];
  const pagination = businessesData?.pagination;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{pagination?.total || 0}</p>
          <p className="text-sm text-white/50">Total Businesses</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {businesses.filter(b => b.verified).length}
          </p>
          <p className="text-sm text-white/50">Verified</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">
            {businesses.filter(b => !b.verified && b.active).length}
          </p>
          <p className="text-sm text-white/50">Pending Verification</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">
            {businesses.filter(b => b.featured).length}
          </p>
          <p className="text-sm text-white/50">Featured</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={businessSearch}
            onChange={(e) => setBusinessSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <select
          value={businessStatusFilter}
          onChange={(e) => setBusinessStatusFilter(e.target.value)}
          className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="" className="bg-neutral-900">All Status</option>
          <option value="active" className="bg-neutral-900">Active</option>
          <option value="verified" className="bg-neutral-900">Verified</option>
          <option value="featured" className="bg-neutral-900">Featured</option>
          <option value="suspended" className="bg-neutral-900">Suspended</option>
        </select>
        <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map(business => (
          <div 
            key={business.id} 
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                {business.logoImage ? (
                  <Image src={business.logoImage} alt={business.name} width={56} height={56} className="rounded-xl object-cover" />
                ) : (
                  <Building2 className="h-7 w-7 text-white/40" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {business.featured && (
                  <span className="p-1.5 rounded-lg bg-amber-500/20" title="Featured">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </span>
                )}
                {business.verified && (
                  <span className="p-1.5 rounded-lg bg-emerald-500/20" title="Verified">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  business.active ? getStatusColor('ACTIVE') : getStatusColor('SUSPENDED')
                }`}>
                  {business.active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-lg text-white mb-1 truncate">{business.name}</h3>
            <p className="text-sm text-white/50 mb-3">{business.category?.name || 'Uncategorized'}</p>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-medium text-white">{business.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-white/40">
                ({business.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
              <MapPin className="h-4 w-4" />
              <span>{business.city}, {business.state}</span>
            </div>

            <div className="pt-4 border-t border-white/10 mb-4">
              <p className="text-xs text-white/40 mb-1">Owner</p>
              <p className="text-sm font-medium text-white">
                {business.owner?.firstName} {business.owner?.lastName}
              </p>
              <p className="text-xs text-white/50">{business.owner?.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.open(`/business/${business.slug}`, '_blank')}
                className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View
              </button>
              {!business.verified && (
                <button 
                  onClick={() => onBusinessAction(business.id, 'verify')}
                  className="flex-1 h-10 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify
                </button>
              )}
              {!business.featured && business.verified && (
                <button 
                  onClick={() => onBusinessAction(business.id, 'feature')}
                  className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors flex items-center justify-center"
                  title="Feature Business"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
              {business.active ? (
                <button 
                  onClick={() => onBusinessAction(business.id, 'suspend')}
                  className="h-10 w-10 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                  title="Suspend"
                >
                  <Ban className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={() => onBusinessAction(business.id, 'activate')}
                  className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center"
                  title="Activate"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-white/50">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBusinessPage(Math.max(1, businessPage - 1))}
              disabled={businessPage === 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-white/70" />
            </button>
            <span className="px-3 py-1 text-sm text-white/70">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setBusinessPage(Math.min(pagination.totalPages, businessPage + 1))}
              disabled={businessPage === pagination.totalPages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-white/70" />
            </button>
          </div>
        </div>
      )}

      {businesses.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/50">No businesses found</p>
        </div>
      )}
    </div>
  );
}
