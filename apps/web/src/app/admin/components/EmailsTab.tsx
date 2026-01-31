'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Eye,
    Mail,
    RefreshCw,
    Search,
    Send,
    TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { EmailLogsResponse, EmailStats, EmailTemplate } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

interface EmailsTabProps {
  token: string | null;
}

export function EmailsTab({ token }: EmailsTabProps) {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logs, setLogs] = useState<EmailLogsResponse | null>(null);
  const [templates, setTemplates] = useState<{ templates: EmailTemplate[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/api/admin/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch templates
      const templatesRes = await fetch(`${API_BASE}/api/admin/emails/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (templatesRes.ok) setTemplates(await templatesRes.json());

      // Build logs URL with filters
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (templateFilter !== 'all') params.append('template', templateFilter);
      if (searchEmail) params.append('email', searchEmail);

      const logsRes = await fetch(`${API_BASE}/api/admin/emails/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (error) {
      console.error('Failed to fetch email data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, templateFilter, searchEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const previewTemplate = async (templateId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/emails/templates/${templateId}/preview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
        setSelectedTemplate(templateId);
      }
    } catch (error) {
      console.error('Failed to preview template:', error);
    }
  };

  const sendTestEmail = async () => {
    if (!token) return;
    const email = prompt('Enter email address to send test to:');
    if (!email) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/emails/test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: 'welcome', email }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to send test email');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-blue-500/20 text-blue-400';
      case 'appointment': return 'bg-purple-500/20 text-purple-400';
      case 'business': return 'bg-green-500/20 text-green-400';
      case 'account': return 'bg-orange-500/20 text-orange-400';
      case 'marketing': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Total Emails</CardDescription>
            <CardTitle className="text-3xl text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-500" />
              {stats?.total || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Successfully Sent</CardDescription>
            <CardTitle className="text-3xl text-green-400 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              {stats?.sent || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl text-red-400 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              {stats?.failed || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl text-blue-400 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              {stats?.total ? ((stats.sent / stats.total) * 100).toFixed(1) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Email Templates */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Email Templates</CardTitle>
              <CardDescription>Preview and test email templates</CardDescription>
            </div>
            <Button onClick={sendTestEmail} variant="outline" className="gap-2">
              <Send className="w-4 h-4" /> Send Test Email
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {templates?.templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? 'default' : 'outline'}
                className={`h-auto py-3 px-4 flex flex-col items-start gap-1 ${
                  selectedTemplate === template.id ? 'bg-purple-600' : ''
                }`}
                onClick={() => previewTemplate(template.id)}
              >
                <span className="text-xs font-medium truncate w-full">{template.name}</span>
                <Badge variant="secondary" className={`text-[10px] ${getCategoryColor(template.category)}`}>
                  {template.category}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Template Preview */}
          {previewHtml && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Preview: {selectedTemplate}</h3>
                <Button variant="ghost" size="sm" onClick={() => setPreviewHtml(null)}>
                  Close Preview
                </Button>
              </div>
              <div className="border border-gray-700 rounded-lg overflow-hidden bg-white">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px]"
                  title="Email Preview"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Logs */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Email Logs</CardTitle>
              <CardDescription>View sent email history and status</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-8 w-48 bg-gray-800 border-gray-700"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {templates?.templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Recipient</TableHead>
                  <TableHead className="text-gray-400">Subject</TableHead>
                  <TableHead className="text-gray-400">Template</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Sent At</TableHead>
                  <TableHead className="text-gray-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.data && logs.data.length > 0 ? (
                  logs.data.map((log) => (
                    <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/30">
                      <TableCell className="text-white font-medium">{log.to}</TableCell>
                      <TableCell className="text-gray-300 max-w-xs truncate">{log.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.template}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {log.sentAt
                          ? new Date(log.sentAt).toLocaleString()
                          : new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.error && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert(`Error: ${log.error}`)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No email logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {logs?.pagination && logs.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                Page {logs.pagination.page} of {logs.pagination.totalPages} ({logs.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= logs.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Stats */}
      {stats?.byTemplate && stats.byTemplate.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Emails by Template</CardTitle>
            <CardDescription>Distribution of sent emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {stats.byTemplate.map((item) => (
                <div
                  key={item.template}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <p className="text-xs text-gray-400 truncate">{item.template}</p>
                  <p className="text-xl font-bold text-white">{item._count.template}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
