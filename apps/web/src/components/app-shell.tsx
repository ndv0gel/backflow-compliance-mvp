"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#d9eef6,transparent_35%),radial-gradient(circle_at_80%_0%,#f6e8d9,transparent_30%),linear-gradient(180deg,#f7fafc_0%,#f0f6f8_100%)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">CITY COMPLIANCE</p>
            <p className="text-base font-bold text-slate-900">Backflow Operations Console</p>
          </div>

          {user ? (
            <nav className="flex items-center gap-2 text-sm">
              {user.role === 'ADMIN' ? (
                <>
                  <Link className={`rounded-full px-3 py-1.5 ${pathname?.startsWith('/admin/dashboard') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} href="/admin/dashboard">Dashboard</Link>
                  <Link className={`rounded-full px-3 py-1.5 ${pathname?.startsWith('/admin/devices') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} href="/admin/devices">Devices</Link>
                  <Link className={`rounded-full px-3 py-1.5 ${pathname?.startsWith('/admin/jobs') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} href="/admin/jobs">Jobs</Link>
                  <Link className={`rounded-full px-3 py-1.5 ${pathname?.startsWith('/admin/reports') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} href="/admin/reports">Reports</Link>
                </>
              ) : (
                <>
                  <Link className={`rounded-full px-3 py-1.5 ${pathname?.startsWith('/technician/jobs') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} href="/technician/jobs">Assigned Jobs</Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700"
                type="button"
              >
                Logout
              </button>
            </nav>
          ) : (
            <Link className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" href="/login">
              Login
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
