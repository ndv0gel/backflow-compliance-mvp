"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/components/auth-provider';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: 'admin@city.gov',
      password: 'Admin123!',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      const authenticatedUser = await login(values.email, values.password);
      router.push(authenticatedUser.role === 'ADMIN' ? '/admin/dashboard' : '/technician/jobs');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign in.');
    }
  });

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">SECURE ACCESS</p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Sign In</h1>
      <p className="mt-2 text-sm text-slate-600">Use seeded credentials to validate the MVP workflows.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register('email', { required: 'Email is required.' })}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register('password', { required: 'Password is required.' })}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
        Admin: admin@city.gov / Admin123!
        <br />
        Tester: tester@city.gov / Tester123!
      </div>
    </div>
  );
}
