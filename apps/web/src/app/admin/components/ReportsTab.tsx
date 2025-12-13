'use client';

import { 
  FileText, Download, Calendar, Users, Building2, 
  DollarSign, BarChart3, PieChart, TrendingUp, Clock
} from 'lucide-react';

interface ReportsTabProps {
  onGenerateReport: (type: string, startDate?: string, endDate?: string) => void;
}

const quickReports = [
  { id: 'user-activity', name: 'User Activity Report', icon: Users, description: 'User registrations, logins, and activity trends' },
  { id: 'business-performance', name: 'Business Performance', icon: Building2, description: 'Business metrics, verifications, and growth' },
  { id: 'revenue-analysis', name: 'Revenue Analysis', icon: DollarSign, description: 'Platform revenue and transaction data' },
  { id: 'appointment-analytics', name: 'Appointment Analytics', icon: Calendar, description: 'Booking trends and completion rates' },
  { id: 'review-summary', name: 'Review Summary', icon: BarChart3, description: 'Review distribution and sentiment analysis' },
  { id: 'platform-health', name: 'Platform Health', icon: TrendingUp, description: 'System performance and uptime metrics' },
];

export function ReportsTab({ onGenerateReport }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Reports */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Reports</h3>
            <p className="text-sm text-white/50">Generate instant reports with one click</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickReports.map(report => (
            <button 
              key={report.id}
              onClick={() => onGenerateReport(report.id)}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                <report.icon className="h-5 w-5 text-white/50 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white mb-1">{report.name}</p>
                <p className="text-xs text-white/50">{report.description}</p>
              </div>
              <Download className="h-4 w-4 text-white/30 group-hover:text-purple-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <PieChart className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Custom Report</h3>
              <p className="text-sm text-white/50">Generate a tailored report</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Report Type</label>
              <select className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                <option value="users" className="bg-neutral-900">User Statistics</option>
                <option value="businesses" className="bg-neutral-900">Business Analytics</option>
                <option value="reviews" className="bg-neutral-900">Review Summary</option>
                <option value="appointments" className="bg-neutral-900">Appointment Data</option>
                <option value="revenue" className="bg-neutral-900">Revenue Report</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Start Date</label>
                <input 
                  type="date" 
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">End Date</label>
                <input 
                  type="date" 
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Format</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="pdf" defaultChecked className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-white/70">PDF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="csv" className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-white/70">CSV</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="xlsx" className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-white/70">Excel</span>
                </label>
              </div>
            </div>

            <button className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
              <Download className="h-5 w-5" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Scheduled Reports</h3>
              <p className="text-sm text-white/50">Automated report generation</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white">Weekly User Report</p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Active</span>
              </div>
              <p className="text-sm text-white/50">Every Monday at 9:00 AM</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white">Monthly Business Report</p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Active</span>
              </div>
              <p className="text-sm text-white/50">1st of every month</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white">Daily Revenue Summary</p>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/50 text-xs">Paused</span>
              </div>
              <p className="text-sm text-white/50">Every day at 11:59 PM</p>
            </div>

            <button className="w-full h-10 rounded-lg border-2 border-dashed border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/70 transition-colors">
              + Schedule New Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
