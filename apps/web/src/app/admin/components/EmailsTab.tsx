'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    AlertTriangle,
    Ban,
    CheckCircle,
    Clock,
    Eye,
    Mail,
    MailX,
    RefreshCw,
    Search,
    Send,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { EmailBounce, EmailEvent, EmailLogsResponse, EmailStats, EmailTemplate } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

interface EmailsTabProps {
  token: string | null;
}

export function EmailsTab({ token }: EmailsTabProps) {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logs, setLogs] = useState<EmailLogsResponse | null>(null);
  const [bounces, setBounces] = useState<EmailBounce[]>([]);
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [templates, setTemplates] = useState<{ templates: EmailTemplate[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('logs');

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

      // Fetch bounces
      const bouncesRes = await fetch(`${API_BASE}/api/admin/emails/bounces`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bouncesRes.ok) {
        const bouncesData = await bouncesRes.json();
        setBounces(bouncesData.bounces || []);
      }

      // Fetch events
      const eventsRes = await fetch(`${API_BASE}/api/admin/emails/events?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
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

  const unsuppressEmail = async (email: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to unsuppress ${email}? They will start receiving emails again.`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/emails/bounces/${encodeURIComponent(email)}/unsuppress`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Email unsuppressed successfully');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to unsuppress email');
      }
    } catch (error) {
      alert('Failed to unsuppress email');
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

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'delivered':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case 'bounced':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><MailX className="w-3 h-3 mr-1" /> Bounced</Badge>;
      case 'complained':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Complaint</Badge>;
      case 'opened':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Eye className="w-3 h-3 mr-1" /> Opened</Badge>;
      case 'clicked':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><TrendingUp className="w-3 h-3 mr-1" /> Clicked</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Total Emails</CardDescription>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              {stats?.total || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Sent</CardDescription>
            <CardTitle className="text-2xl text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {stats?.sent || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {stats?.failed || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-2xl text-blue-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {stats?.successRate || '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Suppressed</CardDescription>
            <CardTitle className="text-2xl text-yellow-400 flex items-center gap-2">
              <Ban className="w-5 h-5" />
              {stats?.deliverability?.suppressed || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Bounced</CardDescription>
            <CardTitle className="text-2xl text-orange-400 flex items-center gap-2">
              <MailX className="w-5 h-5" />
              {stats?.deliverability?.bounced || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription>Complaints</CardDescription>
            <CardTitle className="text-2xl text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              {stats?.deliverability?.complaints || 0}
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

      {/* Tabs for Logs, Bounces, Events */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="logs" className="data-[state=active]:bg-purple-600">
            <Mail className="w-4 h-4 mr-2" /> Logs
          </TabsTrigger>
          <TabsTrigger value="bounces" className="data-[state=active]:bg-purple-600">
            <MailX className="w-4 h-4 mr-2" /> Bounces
            {bounces.filter(b => b.isSupressed).length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {bounces.filter(b => b.isSupressed).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
            <TrendingUp className="w-4 h-4 mr-2" /> Events
          </TabsTrigger>
        </TabsList>

        {/* Email Logs Tab */}
        <TabsContent value="logs">
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
        </TabsContent>

        {/* Bounces Tab */}
        <TabsContent value="bounces">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Bounced & Suppressed Emails</CardTitle>
                  <CardDescription>Manage email addresses that have bounced or been suppressed</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Bounce Count</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Last Bounce</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400 w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bounces.length > 0 ? (
                      bounces.map((bounce) => (
                        <TableRow key={bounce.id} className="border-gray-800 hover:bg-gray-800/30">
                          <TableCell className="text-white font-medium">{bounce.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={bounce.bounceCount >= 3 ? 'text-red-400' : 'text-yellow-400'}>
                              {bounce.bounceCount} bounces
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bounce.complainedAt ? (
                              <Badge className="bg-orange-500/20 text-orange-400">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Complaint
                              </Badge>
                            ) : bounce.bounceType ? (
                              <Badge className={bounce.bounceType === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                {bounce.bounceType === 'hard' ? 'Hard Bounce' : 'Soft Bounce'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unknown</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {bounce.lastBounceAt ? new Date(bounce.lastBounceAt).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>
                            {bounce.isSupressed ? (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                <Ban className="w-3 h-3 mr-1" /> Suppressed
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {bounce.isSupressed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unsuppressEmail(bounce.email)}
                                className="text-blue-400 hover:text-blue-300"
                                title="Unsuppress this email"
                              >
                                <Undo2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
                          No bounced emails - great deliverability!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Email Events</CardTitle>
                  <CardDescription>Real-time email delivery events from webhooks</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Event</TableHead>
                      <TableHead className="text-gray-400">Details</TableHead>
                      <TableHead className="text-gray-400">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length > 0 ? (
                      events.map((event) => (
                        <TableRow key={event.id} className="border-gray-800 hover:bg-gray-800/30">
                          <TableCell className="text-white font-medium">{event.email}</TableCell>
                          <TableCell>{getEventBadge(event.eventType)}</TableCell>
                          <TableCell className="text-gray-400 text-sm max-w-xs truncate">
                            {event.reason || event.bounceType || '-'}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {new Date(event.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No email events yet - events appear when webhooks are received
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  <p className="text-xl font-bold text-white">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
