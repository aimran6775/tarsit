'use client';

import { 
  Server, Database, HardDrive, Clock, Activity, 
  CheckCircle, AlertTriangle, XCircle, RefreshCw, Zap,
  Globe, Shield, TrendingUp
} from 'lucide-react';
import type { SystemHealth, AIInsights } from '../types';
import { getHealthColor, formatUptime, formatBytes } from '../types';

interface SystemTabProps {
  systemHealth: SystemHealth | null;
  aiInsights: AIInsights | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function SystemTab({ systemHealth, aiInsights, onRefresh, isRefreshing }: SystemTabProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'unhealthy':
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-white/50" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            systemHealth?.status === 'healthy' ? 'bg-emerald-500/20' : 
            systemHealth?.status === 'degraded' ? 'bg-amber-500/20' : 'bg-red-500/20'
          }`}>
            {getStatusIcon(systemHealth?.status || 'unknown')}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              System Status: <span className={getHealthColor(systemHealth?.status || 'unknown')}>
                {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </h3>
            <p className="text-sm text-white/50">
              Last checked: {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Status */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Database</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemHealth?.database?.status || 'unknown')}
                <span className={`font-medium ${
                  systemHealth?.database?.status === 'connected' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {systemHealth?.database?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-white/50">
            Response time: <span className="text-white font-medium">
              {systemHealth?.database?.responseTime || 0}ms
            </span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <HardDrive className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Memory</p>
              <p className="text-xl font-bold text-white">
                {systemHealth?.memory?.percentage?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                (systemHealth?.memory?.percentage || 0) > 80 ? 'bg-red-500' :
                (systemHealth?.memory?.percentage || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${systemHealth?.memory?.percentage || 0}%` }}
            />
          </div>
          <div className="text-xs text-white/40 mt-2">
            {formatBytes(systemHealth?.memory?.used || 0)} / {formatBytes(systemHealth?.memory?.total || 0)}
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Uptime</p>
              <p className="text-xl font-bold text-white">
                {formatUptime(systemHealth?.uptime || 0)}
              </p>
            </div>
          </div>
          <div className="text-sm text-white/50">
            Environment: <span className="text-white font-medium">
              {systemHealth?.environment || 'N/A'}
            </span>
          </div>
        </div>

        {/* Node Version */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Server className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Node.js</p>
              <p className="text-xl font-bold text-white">
                {systemHealth?.nodeVersion || 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-sm text-white/50">
            Runtime: <span className="text-white font-medium">Node.js</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Sentiment */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-medium text-white/70">Customer Sentiment</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${
                  aiInsights.customerSentiment.overall === 'positive' ? 'text-emerald-400' :
                  aiInsights.customerSentiment.overall === 'negative' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {aiInsights.customerSentiment.score}%
                </span>
                <span className="text-sm text-white/50 capitalize">
                  {aiInsights.customerSentiment.overall}
                </span>
              </div>
            </div>

            {/* Growth Prediction */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <p className="text-sm font-medium text-white/70">Growth Prediction</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-emerald-400">
                  +{aiInsights.growthPrediction}%
                </span>
                <span className="text-sm text-white/50">next month</span>
              </div>
            </div>

            {/* Trending Categories */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-purple-400" />
                <p className="text-sm font-medium text-white/70">Trending Categories</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiInsights.businessTrends.growing.slice(0, 3).map((trend, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs"
                  >
                    {trend}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {aiInsights.recommendations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-white/70 mb-3">Recommendations</p>
              <div className="space-y-2">
                {aiInsights.recommendations.map((rec, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <Shield className="h-4 w-4 text-purple-400 mt-0.5" />
                    <p className="text-sm text-white/70">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <RefreshCw className="h-5 w-5 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white">Clear Cache</p>
          <p className="text-xs text-white/50">Refresh system cache</p>
        </button>
        <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Database className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-sm font-medium text-white">Backup DB</p>
          <p className="text-xs text-white/50">Create database backup</p>
        </button>
        <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Activity className="h-5 w-5 text-emerald-400 mb-2" />
          <p className="text-sm font-medium text-white">View Logs</p>
          <p className="text-xs text-white/50">System error logs</p>
        </button>
        <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Server className="h-5 w-5 text-amber-400 mb-2" />
          <p className="text-sm font-medium text-white">Restart Services</p>
          <p className="text-xs text-white/50">Restart all services</p>
        </button>
      </div>
    </div>
  );
}
