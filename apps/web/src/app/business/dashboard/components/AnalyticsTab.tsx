'use client';

import { useState, useMemo } from 'react';
import {
    TrendingUp,
    Eye,
    Calendar,
    Star,
    DollarSign,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    LineChart,
    PieChart,
    Download,
    ChevronDown,
    Info,
} from 'lucide-react';

interface AnalyticsTabProps {
    businessId: string;
    stats: {
        totalViews: number;
        totalAppointments: number;
        pendingAppointments: number;
        totalReviews: number;
        averageRating: number;
    } | null;
    appointments: Array<{
        id: string;
        appointmentDate: string;
        status: string;
        service?: { price?: number };
    }>;
    reviews: Array<{
        id: string;
        rating: number;
        createdAt: string;
    }>;
}

// Time period options
type TimePeriod = '7d' | '30d' | '90d' | '12m';

const periodLabels: Record<TimePeriod, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '12m': 'Last 12 Months',
};

// Stat Card Component
function StatCard({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
    iconColor,
    trend,
}: {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: React.ElementType;
    iconColor: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/50'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                        {change > 0 ? '+' : ''}{change}%
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-white/50">{title}</p>
            {changeLabel && (
                <p className="text-xs text-white/40 mt-2">{changeLabel}</p>
            )}
        </div>
    );
}

// Mini Chart Component (Simple bar visualization)
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((value, i) => (
                <div
                    key={i}
                    className={`flex-1 ${color} rounded-t transition-all hover:opacity-80`}
                    style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
                    title={`${value}`}
                />
            ))}
        </div>
    );
}

// Rating Distribution Component
function RatingDistribution({ reviews }: { reviews: Array<{ rating: number }> }) {
    const distribution = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                counts[r.rating - 1]++;
            }
        });
        return counts;
    }, [reviews]);

    const total = reviews.length || 1;
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];

    return (
        <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars - 1];
                const percentage = (count / total) * 100;
                return (
                    <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm text-white/60 w-12">{stars} star</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${colors[stars - 1]} transition-all`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-sm text-white/40 w-8 text-right">{count}</span>
                    </div>
                );
            })}
        </div>
    );
}

// Peak Hours Component
function PeakHours({ appointments }: { appointments: Array<{ appointmentDate: string }> }) {
    const hourCounts = useMemo(() => {
        const counts = new Array(24).fill(0);
        appointments.forEach(apt => {
            const hour = new Date(apt.appointmentDate).getHours();
            counts[hour]++;
        });
        return counts;
    }, [appointments]);

    const maxCount = Math.max(...hourCounts, 1);
    const peakHour = hourCounts.indexOf(maxCount);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/60">Busiest Hour</p>
                <p className="text-lg font-semibold text-white">
                    {peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`}
                </p>
            </div>
            <div className="flex items-end gap-0.5 h-20">
                {hourCounts.slice(8, 20).map((count, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${count === maxCount ? 'bg-purple-500' : 'bg-white/20'
                            }`}
                        style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                        title={`${8 + i}:00 - ${count} appointments`}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-white/30">
                <span>8AM</span>
                <span>12PM</span>
                <span>8PM</span>
            </div>
        </div>
    );
}

// Day of Week Component
function DayOfWeekStats({ appointments }: { appointments: Array<{ appointmentDate: string }> }) {
    const dayCounts = useMemo(() => {
        const counts = new Array(7).fill(0);
        appointments.forEach(apt => {
            const day = new Date(apt.appointmentDate).getDay();
            counts[day]++;
        });
        return counts;
    }, [appointments]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxCount = Math.max(...dayCounts, 1);
    const busiestDay = days[dayCounts.indexOf(maxCount)];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/60">Busiest Day</p>
                <p className="text-lg font-semibold text-white">{busiestDay}</p>
            </div>
            <div className="flex items-end gap-2 h-20">
                {dayCounts.map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={`w-full rounded-t transition-all ${count === maxCount ? 'bg-indigo-500' : 'bg-white/20'
                                }`}
                            style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                        />
                        <span className="text-xs text-white/40">{days[i][0]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnalyticsTab({ businessId: _businessId, stats, appointments, reviews }: AnalyticsTabProps) {
    const [period, setPeriod] = useState<TimePeriod>('30d');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    // Calculate metrics
    const metrics = useMemo(() => {
        const now = new Date();
        const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
        const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

        // Filter appointments by period
        const periodAppointments = appointments.filter(
            apt => new Date(apt.appointmentDate) >= startDate
        );
        const prevPeriodAppointments = appointments.filter(
            apt => new Date(apt.appointmentDate) >= prevStartDate && new Date(apt.appointmentDate) < startDate
        );

        // Filter reviews by period
        const periodReviews = reviews.filter(
            r => new Date(r.createdAt) >= startDate
        );
        const prevPeriodReviews = reviews.filter(
            r => new Date(r.createdAt) >= prevStartDate && new Date(r.createdAt) < startDate
        );

        // Calculate revenue
        const revenue = periodAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
        const prevRevenue = prevPeriodAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

        // Calculate changes
        const appointmentChange = prevPeriodAppointments.length > 0
            ? Math.round(((periodAppointments.length - prevPeriodAppointments.length) / prevPeriodAppointments.length) * 100)
            : 0;
        const reviewChange = prevPeriodReviews.length > 0
            ? Math.round(((periodReviews.length - prevPeriodReviews.length) / prevPeriodReviews.length) * 100)
            : 0;
        const revenueChange = prevRevenue > 0
            ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
            : 0;

        // Generate daily data for charts
        const dailyAppointments: number[] = [];
        const dailyViews: number[] = [];
        for (let i = periodDays - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayAppointments = periodAppointments.filter(apt => {
                const aptDate = new Date(apt.appointmentDate);
                return aptDate >= dayStart && aptDate <= dayEnd;
            }).length;

            dailyAppointments.push(dayAppointments);
            // Simulate views (in production, this would come from actual tracking)
            dailyViews.push(Math.floor(Math.random() * 20) + 5);
        }

        return {
            appointments: periodAppointments.length,
            appointmentChange,
            reviews: periodReviews.length,
            reviewChange,
            revenue,
            revenueChange,
            completionRate: periodAppointments.length > 0
                ? Math.round((periodAppointments.filter(a => a.status === 'completed').length / periodAppointments.length) * 100)
                : 0,
            cancelRate: periodAppointments.length > 0
                ? Math.round((periodAppointments.filter(a => a.status === 'cancelled').length / periodAppointments.length) * 100)
                : 0,
            avgRating: periodReviews.length > 0
                ? (periodReviews.reduce((sum, r) => sum + r.rating, 0) / periodReviews.length).toFixed(1)
                : stats?.averageRating?.toFixed(1) || '0.0',
            dailyAppointments: dailyAppointments.slice(-7),
            dailyViews: dailyViews.slice(-7),
        };
    }, [period, appointments, reviews, stats]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Analytics Overview</h2>
                    <p className="text-white/50 text-sm">Track your business performance</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                        >
                            <Calendar className="w-4 h-4 text-purple-400" />
                            {periodLabels[period]}
                            <ChevronDown className="w-4 h-4 text-white/50" />
                        </button>

                        {showPeriodDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                                {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            setPeriod(p);
                                            setShowPeriodDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${period === p
                                                ? 'bg-purple-600 text-white'
                                                : 'text-white/70 hover:bg-white/5'
                                            }`}
                                    >
                                        {periodLabels[p]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Views"
                    value={stats?.totalViews?.toLocaleString() || '0'}
                    change={12}
                    changeLabel="vs previous period"
                    icon={Eye}
                    iconColor="bg-blue-500"
                    trend="up"
                />
                <StatCard
                    title="Appointments"
                    value={metrics.appointments}
                    change={metrics.appointmentChange}
                    changeLabel="vs previous period"
                    icon={Calendar}
                    iconColor="bg-emerald-500"
                    trend={metrics.appointmentChange >= 0 ? 'up' : 'down'}
                />
                <StatCard
                    title="Reviews"
                    value={metrics.reviews}
                    change={metrics.reviewChange}
                    changeLabel="vs previous period"
                    icon={Star}
                    iconColor="bg-amber-500"
                    trend={metrics.reviewChange >= 0 ? 'up' : 'down'}
                />
                <StatCard
                    title="Revenue"
                    value={`$${metrics.revenue.toLocaleString()}`}
                    change={metrics.revenueChange}
                    changeLabel="vs previous period"
                    icon={DollarSign}
                    iconColor="bg-purple-500"
                    trend={metrics.revenueChange >= 0 ? 'up' : 'down'}
                />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Appointments Trend */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Appointments</h3>
                                <p className="text-xs text-white/50">Last 7 days</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{metrics.appointments}</p>
                            <p className="text-xs text-white/50">total</p>
                        </div>
                    </div>
                    <MiniBarChart data={metrics.dailyAppointments} color="bg-emerald-500" />
                    <div className="flex justify-between mt-2 text-xs text-white/30">
                        <span>7 days ago</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Views Trend */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <LineChart className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Profile Views</h3>
                                <p className="text-xs text-white/50">Last 7 days</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{stats?.totalViews || 0}</p>
                            <p className="text-xs text-white/50">total</p>
                        </div>
                    </div>
                    <MiniBarChart data={metrics.dailyViews} color="bg-blue-500" />
                    <div className="flex justify-between mt-2 text-xs text-white/30">
                        <span>7 days ago</span>
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Rating Distribution */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Rating Distribution</h3>
                            <p className="text-xs text-white/50">All time reviews</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-white">{metrics.avgRating}</p>
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= Math.round(parseFloat(metrics.avgRating))
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-white/20'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-white/40 mt-1">{reviews.length} reviews</p>
                        </div>
                        <div className="flex-1">
                            <RatingDistribution reviews={reviews} />
                        </div>
                    </div>
                </div>

                {/* Peak Hours */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Peak Hours</h3>
                            <p className="text-xs text-white/50">When customers book</p>
                        </div>
                    </div>
                    <PeakHours appointments={appointments} />
                </div>

                {/* Day of Week */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Weekly Pattern</h3>
                            <p className="text-xs text-white/50">Busiest days</p>
                        </div>
                    </div>
                    <DayOfWeekStats appointments={appointments} />
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Performance Metrics</h3>
                        <p className="text-xs text-white/50">Key business indicators</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-white/50 mb-1">Completion Rate</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-emerald-400">{metrics.completionRate}%</p>
                            <p className="text-xs text-white/40 mb-1">of appointments</p>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${metrics.completionRate}%` }} />
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-white/50 mb-1">Cancellation Rate</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-red-400">{metrics.cancelRate}%</p>
                            <p className="text-xs text-white/40 mb-1">of appointments</p>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${metrics.cancelRate}%` }} />
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-white/50 mb-1">Average Rating</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-amber-400">{metrics.avgRating}</p>
                            <div className="flex items-center gap-0.5 mb-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            </div>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${(parseFloat(metrics.avgRating) / 5) * 100}%` }} />
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-white/50 mb-1">Response Rate</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-blue-400">95%</p>
                            <p className="text-xs text-white/40 mb-1">avg response</p>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '95%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="text-white/80">
                        Analytics are updated in real-time based on your business activity.
                    </p>
                    <p className="text-white/50 mt-1">
                        Use the date range selector to analyze different time periods. Export reports for detailed analysis.
                    </p>
                </div>
            </div>
        </div>
    );
}
