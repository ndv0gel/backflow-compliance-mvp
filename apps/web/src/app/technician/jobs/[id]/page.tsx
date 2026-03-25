"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { RouteGuard } from '@/components/route-guard';
import { useAuth } from '@/components/auth-provider';
import { apiRequest } from '@/lib/api';
import type { Job, UploadedAsset } from '@/lib/types';

interface SubmissionFormValues {
  testDate: string;
  checkValve1: number;
  checkValve2: number;
  reliefValve: number;
  testResult: 'PASS' | 'FAIL';
  notes: string;
}

interface TestSubmissionResponse {
  id: string;
  testId: string;
  pdfFile?: {
    url: string;
  };
}

export default function TechnicianJobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => params.id, [params.id]);
  const { token } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SubmissionFormValues>({
    defaultValues: {
      testDate: new Date().toISOString().slice(0, 16),
      checkValve1: 0,
      checkValve2: 0,
      reliefValve: 0,
      testResult: 'PASS',
      notes: '',
    },
  });

  useEffect(() => {
    const loadJob = async () => {
      if (!token || !jobId) {
        return;
      }

      try {
        setError(null);
        const record = await apiRequest<Job>(`/jobs/${jobId}`, {}, token);
        setJob(record);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load job details.');
      }
    };

    void loadJob();
  }, [token, jobId]);

  const uploadAsset = async (file: File, kind: 'PHOTO' | 'SIGNATURE'): Promise<UploadedAsset> => {
    if (!token || !job) {
      throw new Error('Missing auth or job context.');
    }

    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('deviceId', job.deviceId);
    formData.append('file', file);

    return apiRequest<UploadedAsset>('/uploads', { method: 'POST', body: formData }, token);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!token || !job) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      const photoFileIds: string[] = [];
      let signatureFileId: string | undefined;

      if (photoFile) {
        const uploadedPhoto = await uploadAsset(photoFile, 'PHOTO');
        photoFileIds.push(uploadedPhoto.id);
      }

      if (signatureFile) {
        const uploadedSignature = await uploadAsset(signatureFile, 'SIGNATURE');
        signatureFileId = uploadedSignature.id;
      }

      const result = await apiRequest<TestSubmissionResponse>(
        '/tests',
        {
          method: 'POST',
          body: JSON.stringify({
            testId: `TEST-${Date.now()}`,
            jobId: job.id,
            deviceId: job.deviceId,
            testDate: new Date(values.testDate).toISOString(),
            checkValve1: Number(values.checkValve1),
            checkValve2: Number(values.checkValve2),
            reliefValve: Number(values.reliefValve),
            testResult: values.testResult,
            notes: values.notes,
            photoFileIds,
            signatureFileId,
          }),
        },
        token,
      );

      setSuccessMessage(
        result.pdfFile?.url
          ? `Submission complete. PDF: ${result.pdfFile.url}`
          : 'Submission complete. PDF generated and linked to report.',
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to submit test report.');
    }
  });

  return (
    <RouteGuard roles={['TESTER']}>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Field Test Submission</h1>
          <p className="text-sm text-slate-600">Job {job?.jobId ?? jobId}</p>
        </div>

        {job ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Device {job.device?.deviceId}</p>
            <p>{job.device?.locationAddress}</p>
            <p>{job.device?.city}, {job.device?.state} {job.device?.zip}</p>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Test Date</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              {...register('testDate', { required: true })}
            />
          </label>

          <ReadingInput label="Check Valve 1" register={register('checkValve1', { required: true, min: 0, max: 100 })} />
          <ReadingInput label="Check Valve 2" register={register('checkValve2', { required: true, min: 0, max: 100 })} />
          <ReadingInput label="Relief Valve" register={register('reliefValve', { required: true, min: 0, max: 100 })} />

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Result</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('testResult', { required: true })}>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Notes</span>
            <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2" rows={4} {...register('notes')} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Photo Upload</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Digital Signature Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              onChange={(event) => setSignatureFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {successMessage ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test Report'}
          </button>
        </form>
      </section>
    </RouteGuard>
  );
}

function ReadingInput({
  label,
  register,
}: {
  label: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input type="number" step="0.01" className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register} />
    </label>
  );
}
