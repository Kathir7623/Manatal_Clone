'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../../services/jobService';
import StatusBadge from '../../../components/StatusBadge';
import Pagination from '../../../components/Pagination';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Loader from '../../../components/Loader';
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export default function AdminJobsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Delete modal state
  const [deleteModalJob, setDeleteModalJob] = useState(null);

  // Fetch admin jobs
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminJobs', { search: searchTerm, status: statusFilter, page }],
    queryFn: () =>
      jobService.getAdminJobs({
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 10
      })
  });

  const jobs = data?.jobs || [];
  const totalPages = data?.totalPages || 1;
  const totalJobs = data?.total || 0;

  // Mutation for closing / reopening job
  const toggleStatusMutation = useMutation({
    mutationFn: ({ jobId, currentStatus }) => {
      const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
      return jobService.updateJobStatus(jobId, nextStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    }
  });

  // Mutation for deleting job
  const deleteJobMutation = useMutation({
    mutationFn: (jobId) => jobService.deleteJob(jobId),
    onSuccess: () => {
      setDeleteModalJob(null);
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Listings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your recruitment positions, edit details, and track applicant counts.
          </p>
        </div>

        <Link
          href="/admin/jobs/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ed7a1c] hover:bg-[#d96a12] active:bg-[#b8540b] text-white rounded-xl text-sm font-semibold shadow-sm transition hover:shadow-orange-500/25"
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="CLOSED">Closed Only</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Loader message="Loading job list..." />
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            {error?.message || 'Error fetching jobs'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Job ID</th>
                  <th className="px-6 py-3.5">Title & Location</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Applications</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No jobs matching criteria found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.jobId} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                        {job.jobId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{job.title}</div>
                        <div className="text-xs text-slate-500">
                          {job.location} • {job.employmentType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} type="job" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/jobs/${job.jobId}/applications`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#ed7a1c] border border-orange-200/60 hover:bg-orange-100 transition"
                          title="View received applications"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job.applicationCount}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* View public */}
                          <Link
                            href={`/jobs/${job.jobId}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/jobs/${job.jobId}/edit`}
                            className="p-1.5 text-slate-400 hover:text-[#ed7a1c] hover:bg-orange-50 rounded-lg transition"
                            title="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          {/* Toggle status (Close / Reopen) */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                jobId: job.jobId,
                                currentStatus: job.status
                              })
                            }
                            className={`p-1.5 rounded-lg transition ${
                              job.status === 'OPEN'
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={job.status === 'OPEN' ? 'Close Job' : 'Reopen Job'}
                          >
                            {job.status === 'OPEN' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalJob(job)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalJobs}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalJob}
        onClose={() => setDeleteModalJob(null)}
        title="Confirm Job Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <p className="text-xs font-medium">
              Are you sure you want to delete this job? It will be removed from both public listings and the active jobs portal.
            </p>
          </div>

          <div className="text-sm text-slate-700">
            <span className="text-xs text-slate-400 block">Position to delete:</span>
            <strong className="text-slate-900 block mt-0.5">
              {deleteModalJob?.title} ({deleteModalJob?.jobId})
            </strong>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalJob(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteJobMutation.isPending}
              onClick={() => deleteJobMutation.mutate(deleteModalJob.jobId)}
            >
              Delete Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
