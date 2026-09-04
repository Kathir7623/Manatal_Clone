'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { candidateAuthService } from '../../../services/candidateAuthService';
import { useCandidateAuth } from '../../../context/CandidateAuthContext';
import StatusBadge from '../../../components/StatusBadge';
import Loader from '../../../components/Loader';
import {
  Briefcase,
  ExternalLink,
  FileText,
  AlertCircle,
  ArrowRight,
  Download
} from 'lucide-react';

export default function MyApplicationsPage() {
  const router = useRouter();
  const { candidateUser, isCandidateAuthenticated, loading: authLoading } = useCandidateAuth();

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['myCandidateApplications'],
    queryFn: () => candidateAuthService.getMyApplications(),
    enabled: isCandidateAuthenticated
  });

  React.useEffect(() => {
    if (!authLoading && !isCandidateAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isCandidateAuthenticated, router]);

  if (authLoading) return <Loader message="Verifying candidate account..." />;

  if (!isCandidateAuthenticated) {
    return null;
  }

  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
  const underReviewCount = applications.filter((a) => a.status === 'NEW' || a.status === 'REVIEWING').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            Candidate Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
            Welcome, {candidateUser?.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {candidateUser?.email} • Track your application statuses and interview progression in real time.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ed7a1c] hover:bg-[#d96a12] active:bg-[#b8540b] text-white rounded-xl text-xs font-bold shadow-xs transition hover:shadow-orange-500/25"
        >
          <span>Explore More Jobs</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-center">
          <span className="text-xs text-slate-500 font-medium block">Total Submitted</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{applications.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-center">
          <span className="text-xs text-amber-600 font-medium block">In Review</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{underReviewCount}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-center">
          <span className="text-xs text-emerald-600 font-medium block">Shortlisted / Interview</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{shortlistedCount}</span>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">My Job Applications</h2>
          <span className="text-xs text-slate-400 font-medium">
            {applications.length} {applications.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {isLoading ? (
          <Loader message="Loading your applications..." />
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
            <p className="font-semibold">Unable to fetch applications</p>
            <p className="text-xs mt-1 text-slate-500">{error?.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-3 py-1.5 bg-[#ed7a1c] hover:bg-[#d96a12] text-white rounded-md text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No applications submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't submitted any job applications yet. Explore our open roles and apply today!
            </p>
            <Link
              href="/jobs"
              className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-[#ed7a1c] hover:bg-[#d96a12] active:bg-[#b8540b] text-white rounded-lg text-xs font-semibold transition hover:shadow-orange-500/25"
            >
              Browse Open Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-6 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-orange-50 text-[#ed7a1c] rounded border border-orange-200/60">
                      {app.job?.jobId || 'JOB-REF'}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      App ID: {app.applicationId}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {app.job?.title || 'Job Position'}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{app.job?.location}</span>
                    <span>•</span>
                    <span>{app.job?.employmentType}</span>
                    <span>•</span>
                    <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  </p>

                  {(app.resume?.url || app.resumeUrl) && (
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <a
                        href={app.resume?.url || app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#ed7a1c] font-medium transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Submitted Resume ({app.resume?.originalName || app.resumeFilename || 'Resume.pdf'})</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                      <a
                        href={app.resume?.url || app.resumeUrl}
                        download={app.resume?.originalName || app.resumeFilename || 'Resume.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-[#ed7a1c] hover:text-[#d96a12] bg-orange-50 hover:bg-orange-100 border border-orange-200/50 transition"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Status Column */}
                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium uppercase">
                      Current Status:
                    </span>
                    <StatusBadge status={app.status} type="application" />
                  </div>

                  {app.job?.jobId && (
                    <Link
                      href={`/jobs/${app.job.jobId}`}
                      className="text-xs font-semibold text-[#ed7a1c] hover:text-[#d96a12] flex items-center gap-1 transition"
                    >
                      <span>View Job Description</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
