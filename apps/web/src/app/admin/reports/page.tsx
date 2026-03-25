"use client";

import { useEffect, useState } from 'react';
import { RouteGuard } from '@/components/route-guard';
import { useAuth } from '@/components/auth-provider';
import { apiRequest } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

interface AuditLog {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  userId?: string;
}

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        return;
      }

      try {
        setError(null);
        const [statsData, auditData] = await Promise.all([
          apiRequest<DashboardStats>('/dashboard/stats', {}, token),
          apiRequest<AuditLog[]>('/audit-logs?limit=50', {}, token),
        ]);
        setStats(statsData);
        setAuditLogs(auditData);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load reports.');
      }
    };

    void load();
  }, [token]);

  return (
    <RouteGuard roles={['ADMIN']}>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Audit</h1>
          <p className="text-sm text-slate-600">Submission results, due statuses, and append-only action logs.</p>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Submissions</h2>
            <div className="mt-3 space-y-2">
              {stats?.recentSubmissions?.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">Device {entry.deviceId}</p>
                  <p className="text-slate-600">{entry.testerName} • {entry.result}</p>
                  <p className="text-xs text-slate-500">{new Date(entry.testDate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Due</h2>
            <div className="mt-3 space-y-2">
              {stats?.upcomingDueTests?.map((entry) => (
                <div key={`${entry.deviceId}-${entry.nextDueDate}`} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">{entry.deviceId}</p>
                  <p className="text-slate-600">{entry.customerName}</p>
                  <p className="text-xs text-slate-500">
                    {entry.complianceStatus.replace('_', ' ')} • {new Date(entry.nextDueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">Audit Trail (Append-Only)</h2>
          <div className="mt-3 space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-800">{log.actionType}</p>
                <p className="text-slate-600">{log.entityType}:{log.entityId}</p>
                <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </RouteGuard>
  );
}
