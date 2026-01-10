'use client';

import Image from 'next/image';
import { 
  CheckCircle, XCircle, FileText, AlertCircle,
  Building2, Clock, Download, ExternalLink
} from 'lucide-react';
import type { VerificationRequest } from '../types';
import { getStatusColor } from '../types';

interface VerificationsTabProps {
  verifications: VerificationRequest[];
  onVerificationAction: (requestId: string, action: 'approve' | 'reject', notes?: string) => void;
}

export function VerificationsTab({ verifications, onVerificationAction }: VerificationsTabProps) {
  const pendingVerifications = verifications.filter(v => v.status === 'PENDING');
  const processedVerifications = verifications.filter(v => v.status !== 'PENDING');

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BUSINESS_LICENSE': return 'Business License';
      case 'IDENTITY': return 'Identity Verification';
      case 'ADDRESS': return 'Address Verification';
      case 'PROFESSIONAL': return 'Professional Certification';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-500/10 backdrop-blur-xl rounded-xl border border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingVerifications.length}</p>
              <p className="text-sm text-white/50">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-xl rounded-xl border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {verifications.filter(v => v.status === 'APPROVED').length}
              </p>
              <p className="text-sm text-white/50">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {verifications.filter(v => v.status === 'REJECTED').length}
              </p>
              <p className="text-sm text-white/50">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            Pending Verifications ({pendingVerifications.length})
          </h3>
        </div>

        {pendingVerifications.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-white/50">No pending verification requests</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pendingVerifications.map(request => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      {request.business.logoImage ? (
                        <Image 
                          src={request.business.logoImage} 
                          alt={request.business.name}
                          width={56}
                          height={56}
                          className="rounded-xl"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">{request.business.name}</h4>
                      <p className="text-sm text-purple-400 font-medium">
                        {getTypeLabel(request.type)}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        by {request.business.owner.firstName} {request.business.owner.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <p className="text-xs text-white/40 mt-2">
                      Submitted {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-white/70 mb-3">
                    Documents ({request.documents.length})
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {request.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-white/70">Document {i + 1}</span>
                        <Download className="h-3 w-3 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onVerificationAction(request.id, 'approve')}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      const notes = prompt('Rejection reason (optional):');
                      onVerificationAction(request.id, 'reject', notes || undefined);
                    }}
                    className="flex-1 h-11 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                  <button 
                    onClick={() => window.open(`/business/${request.business.slug}`, '_blank')}
                    className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    View Business
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Processed */}
      {processedVerifications.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Recently Processed</h3>
          </div>
          <div className="divide-y divide-white/5">
            {processedVerifications.slice(0, 5).map(request => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    request.status === 'APPROVED' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    {request.status === 'APPROVED' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{request.business.name}</p>
                    <p className="text-sm text-white/50">{getTypeLabel(request.type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-white/40 mt-1">
                    {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
