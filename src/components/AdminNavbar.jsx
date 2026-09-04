'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Applications', href: '/admin/applications', icon: Users }
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const isActive = (path) => {
    if (!pathname) return false;
    if (path === '/admin/dashboard') return pathname === '/admin/dashboard';
    if (path === '/admin/applications') return pathname.includes('/applications');
    if (path === '/admin/jobs') return pathname.startsWith('/admin/jobs') && !pathname.includes('/applications');
    return pathname === path;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 sm:h-20 items-center">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <img
                src="/vivantify-logo.png"
                alt="Vivantify Logo"
                className="h-10 sm:h-11 w-auto object-contain"
              />
              <span className="text-[10px] uppercase tracking-wider font-bold bg-[#ed7a1c] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                Recruiter ATS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                      active
                        ? 'bg-orange-50 text-[#ed7a1c] font-bold border border-orange-200/70 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#ed7a1c]' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
              title="Open Public Job Board in new tab"
            >
              <span>View Public Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">{user?.name || 'Recruiter'}</span>
                <span className="text-[11px] text-slate-500">{user?.email || 'admin@resume.com'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition border border-rose-200"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
