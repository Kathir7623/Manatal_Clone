'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../../../services/jobService';
import JobForm from '../../../../components/JobForm';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => jobService.createJob(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      setSuccessInfo(res.data);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to create job.');
    }
  });

  const handleSubmit = (data) => {
    setErrorMessage('');
    setSuccessInfo(null);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs List
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Job</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the position details. You can provide a custom Job ID or leave it blank to automatically generate one (e.g. JOB-2026-0001).
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 my-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Job Created Successfully!</h2>
              <p className="text-sm text-emerald-700 mt-1">
                Generated Job ID:{' '}
                <strong className="font-mono text-base bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {successInfo.jobId}
                </strong>
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                Position "{successInfo.title}" is now open and listed on the public careers portal.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSuccessInfo(null)}
                className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-100/50 transition"
              >
                Create Another Job
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/jobs')}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition"
              >
                View Jobs List
              </button>
            </div>
          </div>
        ) : (
          <JobForm
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            mode="create"
          />
        )}
      </div>
    </div>
  );
}
