'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/AdminNavbar';
import Loader from '../../components/Loader';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, isLoginPage, router, pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader message="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      <AdminNavbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>Resume Collector Admin Portal • Vivantify ATS (Next.js)</p>
      </footer>
    </div>
  );
}
