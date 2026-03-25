"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RouteGuard } from '@/components/route-guard';
import { useAuth } from '@/components/auth-provider';
import { apiRequest } from '@/lib/api';
import type { Job } from '@/lib/types';

export default function TechnicianJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      if (!token) {
        return;
      }

      try {
        setError(null);
        const data = await apiRequest<Job[]>('/jobs', {}, token);
        setJobs(data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load jobs.');
      }
    };

    void loadJobs();
  }, [token]);

  return (
    <RouteGuard roles={['TESTER']}>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assigned Jobs</h1>
          <p className="text-sm text-slate-600">Mobile-ready queue for field testing.</p>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">{job.jobId}</p>
              <p className="text-sm text-slate-700">{job.device?.locationAddress}</p>
              <p className="text-xs text-slate-500">Scheduled: {new Date(job.scheduledDate).toLocaleString()}</p>
              <div className="mt-3">
                <Link
                  className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  href={`/technician/jobs/${job.id}`}
                >
                  Open Job
                </Link>
              </div>
            </article>
          ))}

          {jobs.length === 0 ? <p className="text-sm text-slate-600">No assigned jobs yet.</p> : null}
        </div>
      </section>
    </RouteGuard>
  );
}
