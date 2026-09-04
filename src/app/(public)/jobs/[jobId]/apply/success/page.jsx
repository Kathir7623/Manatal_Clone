'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Briefcase, ArrowLeft } from 'lucide-react';
import Loader from '../../../../../../components/Loader';

function ApplicationSuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();

  const applicationId = searchParams.get('appId') || 'APP-RECORDED';
  const jobId = searchParams.get('jobId') || params?.jobId || 'JOB-REF';
  const jobTitle = searchParams.get('title') || 'Position';
  const candidateName = searchParams.get('name') || 'Candidate';

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Submitted!
        </h1>
        <p className="text-slate-600 text-sm mt-2">
          Thank you <strong className="text-slate-800">{candidateName}</strong>, your application has been successfully received by our hiring team.
        </p>

        {/* Highlighted Reference Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-6 text-left space-y-3">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Applied Position</span>
            <span className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-4 h-4 text-[#ed7a1c] shrink-0" />
              {jobTitle}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Job Reference</span>
              <span className="text-sm font-mono font-bold text-slate-700 block mt-0.5">
                {jobId}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-medium">Application ID</span>
              <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                {applicationId}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
          Please keep your Application ID for your records. If your profile matches our team's requirements, a recruiter will reach out directly.
        </p>

        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl bg-[#ed7a1c] hover:bg-[#d96a12] active:bg-[#b8540b] text-white font-bold text-sm shadow-sm transition hover:shadow-orange-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={<Loader message="Loading application confirmation..." />}>
      <ApplicationSuccessContent />
    </Suspense>
  );
}
