"use client";

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteGuard } from '@/components/route-guard';
import { useAuth } from '@/components/auth-provider';
import { apiRequest } from '@/lib/api';
import type { Device, Job } from '@/lib/types';

interface TesterOption {
  id: string;
  name: string;
  certificationNumber: string;
}

interface JobFormValues {
  jobId: string;
  deviceId: string;
  assignedTesterId: string;
  scheduledDate: string;
}

export default function AdminJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [testers, setTesters] = useState<TesterOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<JobFormValues>();

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const [jobsData, devicesData, testersData] = await Promise.all([
        apiRequest<Job[]>('/jobs', {}, token),
        apiRequest<Device[]>('/devices', {}, token),
        apiRequest<Array<{ id: string; name: string; certificationNumber: string }>>('/testers', {}, token),
      ]);

      setJobs(jobsData);
      setDevices(devicesData);
      setTesters(testersData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load job data.');
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          scheduledDate: new Date(values.scheduledDate).toISOString(),
        }),
      }, token);
      reset();
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create job.');
    }
  });

  return (
    <RouteGuard roles={['ADMIN']}>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
          <p className="text-sm text-slate-600">Assign pending jobs to active testers.</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Job ID</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('jobId', { required: true })} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Scheduled Date</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              {...register('scheduledDate', { required: true })}
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Device</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('deviceId', { required: true })}>
              <option value="">Select a device</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.deviceId} - {device.locationAddress}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-slate-700">Assigned Tester</span>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              {...register('assignedTesterId', { required: true })}
            >
              <option value="">Select a tester</option>
              {testers.map((tester) => (
                <option key={tester.id} value={tester.id}>
                  {tester.name} - {tester.certificationNumber}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Create Job'}
          </button>
        </form>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">{job.jobId}</p>
              <p className="text-sm text-slate-700">Device: {job.device?.deviceId}</p>
              <p className="text-sm text-slate-700">Status: {job.status}</p>
              <p className="text-xs text-slate-500">Scheduled: {new Date(job.scheduledDate).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </RouteGuard>
  );
}
