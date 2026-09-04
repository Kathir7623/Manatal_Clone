'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../../services/jobService';
import Loader from '../../../components/Loader';
import StatusBadge from '../../../components/StatusBadge';
import {
  Briefcase,
  FileCheck2,
  Users,
  CheckCircle,
  Clock,
  Plus,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => jobService.getDashboardStats()
  });

  if (isLoading) return <Loader message="Loading dashboard statistics..." />;

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
        <p className="text-rose-600 font-semibold">Failed to fetch dashboard metrics</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-[#ed7a1c] hover:bg-[#d96a12] text-white text-xs font-semibold rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { recentJobs = [], recentApplications = [] } = data || {};
  const stats = data?.stats || data || {};

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: 'text-[#ed7a1c]',
      bg: 'bg-orange-50',
      href: '/admin/jobs'
    },
    {
      title: 'Open Jobs',
      value: stats?.openJobs ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/jobs?status=OPEN'
    },
    {
      title: 'Closed Jobs',
      value: stats?.closedJobs ?? 0,
      icon: Clock,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      href: '/admin/jobs?status=CLOSED'
    },
    {
      title: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon: Users,
      color: 'text-[#ed7a1c]',
      bg: 'bg-orange-50',
      href: '/admin/applications'
    },
    {
      title: 'New Applications',
      value: stats?.newApplications ?? 0,
      icon: FileCheck2,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/applications?status=NEW'
    },
    {
      title: 'Shortlisted Candidates',
      value: stats?.shortlistedCandidates ?? 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/applications?status=SHORTLISTED'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time overview of active recruitment pipelines and applicant activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ed7a1c] hover:bg-[#d96a12] active:bg-[#b8540b] text-white rounded-xl text-sm font-semibold shadow-sm transition hover:shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </Link>

          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold shadow-xs transition"
          >
            <Users className="w-4 h-4 text-slate-400" />
            All Applications
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-[#ed7a1c]/60 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 truncate transition">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-[#ed7a1c] transition-colors">
                  {card.value}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-[#ed7a1c] flex items-center gap-0.5 transition-colors">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tables Grid: Recent Jobs & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Jobs</h2>
            <Link
              href="/admin/jobs"
              className="text-xs font-semibold text-[#ed7a1c] hover:text-[#d96a12] flex items-center gap-1 transition"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Job ID</th>
                  <th className="px-6 py-3">Job Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Applications</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No jobs created yet. Click "Create Job" to post your first position.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job.jobId} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-700">
                        {job.jobId}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{job.title}</div>
                        <div className="text-xs text-slate-400">{job.location}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={job.status} type="job" />
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#ed7a1c] border border-orange-200/60">
                          {job.applicationCount}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/jobs/${job.jobId}/applications`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#ed7a1c] hover:text-[#d96a12] transition"
                        >
                          Candidates
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Applications Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
              <Link
                href="/admin/applications"
                className="text-xs font-semibold text-[#ed7a1c] hover:text-[#d96a12] flex items-center gap-1 transition"
              >
                View all
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No applications submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {app.candidate?.name || 'Applicant'}
                      </span>
                      <StatusBadge status={app.status} type="application" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      Applied for <strong className="text-slate-700">{app.job?.title}</strong>
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400">
                      <span className="font-mono">{app.applicationId}</span>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/jobs"
              target="_blank"
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
            >
              Public Candidate View
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
