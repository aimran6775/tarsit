'use client';

import { useState } from 'react';
import {
    Bot,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    User,
    Building2,
    Zap,
    RefreshCw,
    CheckSquare,
    Square,
} from 'lucide-react';

interface TarsAction {
    id: string;
    userId?: string;
    businessId?: string;
    actionType: string;
    actionData: Record<string, unknown>;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
    priority: number;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    user?: { firstName: string; lastName: string; email: string };
    business?: { name: string };
}

interface TarsTabProps {
    actions: TarsAction[];
    loading: boolean;
    onApprove: (actionId: string, notes?: string) => Promise<void>;
    onReject: (actionId: string, reason: string) => Promise<void>;
    onBulkReview: (actionIds: string[], decision: 'approve' | 'reject', notes?: string) => Promise<void>;
    onRefresh: () => void;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
    create_appointment: 'Create Appointment',
    cancel_appointment: 'Cancel Appointment',
    modify_appointment: 'Modify Appointment',
    update_business_info: 'Update Business',
    delete_review: 'Delete Review',
    issue_refund: 'Issue Refund',
    modify_user_data: 'Modify User Data',
    bulk_update: 'Bulk Update',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: Clock },
    APPROVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle },
    REJECTED: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
    EXECUTED: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Zap },
    FAILED: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: AlertTriangle },
};

function ActionCard({
    action,
    isSelected,
    onSelect,
    onApprove,
    onReject,
    expanded,
    onToggleExpand,
}: {
    action: TarsAction;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onApprove: (actionId: string, notes?: string) => Promise<void>;
    onReject: (actionId: string, reason: string) => Promise<void>;
    expanded: boolean;
    onToggleExpand: () => void;
}) {
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const statusInfo = STATUS_COLORS[action.status] || STATUS_COLORS.PENDING;
    const StatusIcon = statusInfo.icon;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(action.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setIsProcessing(true);
        try {
            await onReject(action.id, rejectReason);
            setRejectReason('');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`bg-white/5 rounded-xl border transition-all ${isSelected ? 'border-purple-500' : 'border-white/10'
            }`}>
            {/* Header */}
            <div className="p-4 flex items-start gap-4">
                {action.status === 'PENDING' && (
                    <button
                        onClick={() => onSelect(action.id)}
                        className="mt-1 text-white/40 hover:text-white transition-colors"
                    >
                        {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-400" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                    </button>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {action.status}
                        </span>

                        {action.priority > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                Priority: {action.priority}
                            </span>
                        )}

                        <span className="text-white/40 text-xs">
                            {new Date(action.createdAt).toLocaleString()}
                        </span>
                    </div>

                    <h4 className="text-white font-medium mt-2">
                        {ACTION_TYPE_LABELS[action.actionType] || action.actionType}
                    </h4>

                    <p className="text-white/60 text-sm mt-1 line-clamp-2">
                        {action.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                        {action.user && (
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {action.user.firstName} {action.user.lastName}
                            </span>
                        )}
                        {action.business && (
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {action.business.name}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onToggleExpand}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4">
                    <h5 className="text-white/60 text-sm font-medium mb-2">Action Data</h5>
                    <pre className="bg-black/30 rounded-lg p-3 text-xs text-white/70 overflow-x-auto">
                        {JSON.stringify(action.actionData, null, 2)}
                    </pre>

                    {action.reviewedAt && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg">
                            <p className="text-sm text-white/60">
                                <span className="font-medium">Reviewed:</span>{' '}
                                {new Date(action.reviewedAt).toLocaleString()}
                            </p>
                            {action.reviewNotes && (
                                <p className="text-sm text-white/60 mt-1">
                                    <span className="font-medium">Notes:</span> {action.reviewNotes}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions for pending items */}
                    {action.status === 'PENDING' && (
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Reason for rejection..."
                                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
                                />
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing || !rejectReason.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function TarsTab({
    actions,
    loading,
    onApprove,
    onReject,
    onBulkReview,
    onRefresh,
}: TarsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
    const [expandedAction, setExpandedAction] = useState<string | null>(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Filter actions
    const filteredActions = actions.filter((action) => {
        const matchesSearch =
            action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            action.actionType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || action.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = actions.filter((a) => a.status === 'PENDING').length;

    const handleSelectAction = (id: string) => {
        setSelectedActions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const pendingIds = filteredActions
            .filter((a) => a.status === 'PENDING')
            .map((a) => a.id);

        if (selectedActions.size === pendingIds.length) {
            setSelectedActions(new Set());
        } else {
            setSelectedActions(new Set(pendingIds));
        }
    };

    const handleBulkApprove = async () => {
        if (selectedActions.size === 0) return;
        setBulkProcessing(true);
        try {
            await onBulkReview(Array.from(selectedActions), 'approve');
            setSelectedActions(new Set());
        } finally {
            setBulkProcessing(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedActions.size === 0) return;
        const reason = prompt('Enter rejection reason for all selected actions:');
        if (!reason) return;

        setBulkProcessing(true);
        try {
            await onBulkReview(Array.from(selectedActions), 'reject', reason);
            setSelectedActions(new Set());
        } finally {
            setBulkProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">TARS Action Queue</h2>
                        <p className="text-white/50 text-sm">
                            Review and approve AI-requested actions
                        </p>
                    </div>
                </div>

                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400 font-medium">{pendingCount} pending</span>
                    </div>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search actions..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="EXECUTED">Executed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedActions.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <span className="text-purple-400 font-medium">
                        {selectedActions.size} selected
                    </span>
                    <div className="flex-1" />
                    <button
                        onClick={handleBulkApprove}
                        disabled={bulkProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Approve All
                    </button>
                    <button
                        onClick={handleBulkReject}
                        disabled={bulkProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject All
                    </button>
                </div>
            )}

            {/* Select All (for pending) */}
            {filteredActions.some((a) => a.status === 'PENDING') && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        {selectedActions.size === filteredActions.filter((a) => a.status === 'PENDING').length ? (
                            <CheckSquare className="w-4 h-4 text-purple-400" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                        Select all pending
                    </button>
                </div>
            )}

            {/* Action List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
            ) : filteredActions.length === 0 ? (
                <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No actions found</p>
                    <p className="text-white/40 text-sm">
                        {statusFilter === 'PENDING'
                            ? 'All caught up! No pending actions.'
                            : 'Try adjusting your filters.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredActions.map((action) => (
                        <ActionCard
                            key={action.id}
                            action={action}
                            isSelected={selectedActions.has(action.id)}
                            onSelect={handleSelectAction}
                            onApprove={onApprove}
                            onReject={onReject}
                            expanded={expandedAction === action.id}
                            onToggleExpand={() =>
                                setExpandedAction(expandedAction === action.id ? null : action.id)
                            }
                        />
                    ))}
                </div>
            )}

            {/* TARS Info */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                    <Bot className="w-6 h-6 text-purple-400 flex-shrink-0" />
                    <div>
                        <h4 className="text-white font-medium">About TARS Actions</h4>
                        <p className="text-white/60 text-sm mt-1">
                            TARS, the AI assistant, submits action requests when users ask for changes
                            that require administrative approval. Review each request carefully and
                            approve or reject based on the action details and context.
                        </p>
                        <p className="text-white/50 text-xs mt-2">
                            &quot;What&apos;s your humor setting, TARS?&quot; &quot;75%.&quot; - Interstellar
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
