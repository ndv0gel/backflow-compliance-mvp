"use client";

import { useCallback, useEffect, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { RouteGuard } from '@/components/route-guard';
import { useAuth } from '@/components/auth-provider';
import { apiRequest } from '@/lib/api';
import type { Device } from '@/lib/types';

interface DeviceFormValues {
  deviceId: string;
  serialNumber: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  installationDate: string;
  locationAddress: string;
  city: string;
  state: string;
  zip: string;
  customerName: string;
  customerContact: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function AdminDevicesPage() {
  const { token } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DeviceFormValues>({
    defaultValues: {
      state: 'CA',
      status: 'ACTIVE',
    },
  });

  const loadDevices = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const records = await apiRequest<Device[]>('/devices', {}, token);
      setDevices(records);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load devices.');
    }
  }, [token]);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      await apiRequest('/devices', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          installationDate: new Date(`${values.installationDate}T00:00:00`).toISOString(),
        }),
      }, token);

      reset({ state: 'CA', status: 'ACTIVE' });
      await loadDevices();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create device.');
    }
  });

  return (
    <RouteGuard roles={['ADMIN']}>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Device Registry</h1>
          <p className="text-sm text-slate-600">Create and track active backflow devices.</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <Input label="Device ID" register={register('deviceId', { required: true })} />
          <Input label="Serial Number" register={register('serialNumber', { required: true })} />
          <Input label="Device Type" register={register('deviceType', { required: true })} />
          <Input label="Manufacturer" register={register('manufacturer', { required: true })} />
          <Input label="Model" register={register('model', { required: true })} />
          <Input label="Installation Date" type="date" register={register('installationDate', { required: true })} />
          <Input label="Location Address" register={register('locationAddress', { required: true })} />
          <Input label="City" register={register('city', { required: true })} />
          <Input label="State" register={register('state', { required: true })} />
          <Input label="ZIP" register={register('zip', { required: true })} />
          <Input label="Customer Name" register={register('customerName', { required: true })} />
          <Input label="Customer Contact" register={register('customerContact')} />
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Status</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('status', { required: true })}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Create Device'}
          </button>
        </form>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {devices.map((device) => (
            <article key={device.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-900">{device.deviceId}</p>
              <p className="text-sm text-slate-700">{device.deviceType}</p>
              <p className="mt-1 text-xs text-slate-500">
                {device.locationAddress}, {device.city}, {device.state} {device.zip}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-600">Status: {device.status}</p>
            </article>
          ))}
        </div>
      </section>
    </RouteGuard>
  );
}

function Input({
  label,
  register,
  type = 'text',
}: {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input type={type} className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register} />
    </label>
  );
}
