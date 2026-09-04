'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../../../../services/jobService';
import JobForm from '../../../../../components/JobForm';
import Loader from '../../../../../components/Loader';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId;
  const queryClient = useQueryClient();
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['adminJobEdit', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId
  });

  const mutation = useMutation({
    mutationFn: (updatedData) => jobService.updateJob(jobId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminJobEdit', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId] });
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 4000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to update job.');
    }
  });

  if (isLoading) return <Loader message="Loading job specifications..." />;

  if (isError || !job) {
    return (
      <div className="p-8 text-center text-rose-600">
        <p className="font-semibold">Unable to find job {jobId}</p>
        <Link href="/admin/jobs" className="mt-4 inline-block text-xs text-blue-600 font-semibold">
          Return to Jobs List
        </Link>
      </div>
    );
  }

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
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                {job.jobId}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Job Position</h1>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>Job updated successfully! All changes have been synchronized.</span>
          </div>
        )}

        <JobForm
          initialData={job}
          onSubmit={(data) => {
            setErrorMessage('');
            mutation.mutate(data);
          }}
          isSubmitting={mutation.isPending}
          mode="edit"
        />
      </div>
    </div>
  );
}
