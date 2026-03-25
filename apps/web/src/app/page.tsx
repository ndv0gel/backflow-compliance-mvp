import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm md:p-10">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-500">CALIFORNIA TITLE 17 ALIGNED</p>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          Backflow & Plumbing Compliance Management MVP
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Built for city operations teams and field technicians with secure workflows for device tracking,
          test submissions, compliance monitoring, and report generation.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
            Sign In
          </Link>
          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Go To Admin
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-slate-50 shadow-sm">
        <h2 className="text-lg font-bold">MVP Scope</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
          <li>Secure authentication with Admin and Tester roles.</li>
          <li>Device and job lifecycle tracking.</li>
          <li>Field test submission with readings and signatures.</li>
          <li>PDF report generation and secure file storage.</li>
          <li>Annual compliance status engine and admin dashboard.</li>
        </ul>
        <div className="mt-5 rounded-2xl bg-white/10 p-4 text-xs text-slate-100">
          Local starter accounts are seeded in the API environment for immediate MVP validation.
        </div>
      </div>
    </section>
  );
}
