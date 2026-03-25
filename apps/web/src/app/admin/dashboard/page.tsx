"use client";

import { useEffect, useState } from 'react';
import { RouteGuard } from '@/components/route-guard';
import { useAuth } from '@/components/auth-provider';
import { apiRequest } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);
        const data = await apiRequest<DashboardStats>('/dashboard/stats', {}, token);
        setStats(data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [token]);

  return (
    <RouteGuard roles={['ADMIN']}>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Operational compliance snapshot for municipal staff.</p>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading dashboard...</p> : null}
        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Devices" value={stats.totalDevices} tone="slate" />
              <StatCard label="Compliant" value={stats.compliantDevices} tone="green" />
              <StatCard label="Due Soon" value={stats.dueSoonDevices} tone="amber" />
              <StatCard label="Overdue" value={stats.overdueDevices} tone="red" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold text-slate-900">Recent Submissions</h2>
                <div className="mt-3 space-y-2">
                  {stats.recentSubmissions.length === 0 ? (
                    <p className="text-sm text-slate-500">No submissions yet.</p>
                  ) : (
                    stats.recentSubmissions.map((submission) => (
                      <div key={submission.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                        <p className="font-semibold text-slate-800">Device {submission.deviceId}</p>
                        <p className="text-slate-600">
                          Tester {submission.testerName} • {submission.result} • {new Date(submission.testDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold text-slate-900">Upcoming Due Tests</h2>
                <div className="mt-3 space-y-2">
                  {stats.upcomingDueTests.length === 0 ? (
                    <p className="text-sm text-slate-500">No devices due soon.</p>
                  ) : (
                    stats.upcomingDueTests.map((item) => (
                      <div key={`${item.deviceId}-${item.nextDueDate}`} className="rounded-xl bg-slate-50 p-3 text-sm">
                        <p className="font-semibold text-slate-800">{item.deviceId}</p>
                        <p className="text-slate-600">
                          {item.customerName} • {item.complianceStatus.replace('_', ' ')} • Due {new Date(item.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </RouteGuard>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'slate' | 'green' | 'amber' | 'red';
}) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-900',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-900',
  } as const;

  return (
    <article className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </article>
  );
}
