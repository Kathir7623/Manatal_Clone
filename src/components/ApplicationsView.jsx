'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/applicationService';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';
import Modal from './Modal';
import Button from './Button';
import Loader from './Loader';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar
} from 'lucide-react';

const STATUS_OPTIONS = [
  'NEW',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED'
];

export default function ApplicationsView() {
  const params = useParams();
  const jobId = params?.jobId;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState(null);

  // Fetch applications
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['applications', { jobId, search: searchTerm, status: statusFilter, page }],
    queryFn: () => {
      if (jobId) {
        return applicationService.getApplicationsForJob(jobId, {
          search: searchTerm,
          status: statusFilter,
          page,
          limit: 10
        });
      }
      return applicationService.getAllApplications({
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 10
      });
    }
  });

  const applications = data?.applications || [];
  const currentJob = data?.job;
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationService.updateApplicationStatus(id, status),
    onSuccess: (updatedApp) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      if (selectedApp && (selectedApp._id === updatedApp.data._id || selectedApp.applicationId === updatedApp.data.applicationId)) {
        setSelectedApp(updatedApp.data);
      }
    }
  });

  const handleStatusChange = (appId, newStatus) => {
    updateStatusMutation.mutate({ id: appId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {jobId && (
            <Link
              href="/admin/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all jobs
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {jobId && currentJob ? (
              <span>
                {currentJob.title}{' '}
                <span className="font-mono text-sm font-normal text-slate-500">({currentJob.jobId})</span>
              </span>
            ) : (
              'Candidate Applications'
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {jobId
              ? `Review, evaluate, and manage candidate submissions specifically for this role.`
              : `Review candidate resumes, assess qualification criteria, and advance candidates.`}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, email, ID..."
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
            <option value="ALL">All Application Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Loader message="Fetching applications..." />
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            {error?.message || 'Error fetching applications'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  {!jobId && <th className="px-6 py-3.5">Position</th>}
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={jobId ? 5 : 6}
                      className="px-6 py-12 text-center text-slate-400 text-xs"
                    >
                      No candidate applications found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition">
                      {/* Candidate Column */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {app.candidate?.name || 'Applicant'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{app.candidate?.email}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {app.applicationId}
                          </span>
                        </div>
                      </td>

                      {/* Job Title (if in global list) */}
                      {!jobId && (
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {app.job?.title || 'Unknown Job'}
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            {app.job?.jobId}
                          </div>
                        </td>
                      )}

                      {/* Experience */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {app.candidate?.experience || 'N/A'}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            disabled={updateStatusMutation.isPending}
                            className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                            title="View Full Candidate Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {app.resume?.url && (
                            <a
                              href={app.resume.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#ed7a1c] bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition"
                              title="Open Resume"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Resume</span>
                            </a>
                          )}
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
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Candidate Details Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Candidate Profile & Application"
        maxWidth="max-w-2xl"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Header / ID Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {selectedApp.applicationId}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedApp.candidate?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Applied for: <strong className="text-slate-800">{selectedApp.job?.title}</strong> ({selectedApp.job?.jobId})
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  Application Status
                </span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                  className="text-xs font-bold rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 shadow-xs focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Email</span>
                  <a
                    href={`mailto:${selectedApp.candidate?.email}`}
                    className="font-semibold text-[#ed7a1c] hover:underline"
                  >
                    {selectedApp.candidate?.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Phone</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.candidate?.phone}
                  </span>
                </div>
              </div>

              {selectedApp.candidate?.dateOfBirth && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Date of Birth</span>
                    <span className="font-semibold text-slate-800">
                      {selectedApp.candidate?.dateOfBirth}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Experience</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.candidate?.experience}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Current Company</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.candidate?.currentCompany || 'Not specified'}
                  </span>
                </div>
              </div>

              {selectedApp.candidate?.currentLocation && (
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Current Location</span>
                    <span className="font-semibold text-slate-800">
                      {selectedApp.candidate?.currentLocation}
                    </span>
                  </div>
                </div>
              )}

              {selectedApp.candidate?.currentSalary?.amount && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Current Salary (CTC)</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.candidate.currentSalary.amount} {selectedApp.candidate.currentSalary.currency} / {selectedApp.candidate.currentSalary.frequency}
                  </span>
                </div>
              )}

              {selectedApp.candidate?.expectedSalary?.amount && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Expected Salary (CTC)</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedApp.candidate.expectedSalary.amount} {selectedApp.candidate.expectedSalary.currency} / {selectedApp.candidate.expectedSalary.frequency}
                  </span>
                </div>
              )}

              {selectedApp.candidate?.noticePeriod && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Notice Period</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.candidate.noticePeriod} (Serving: {selectedApp.candidate?.servingNoticePeriod || 'No'})
                  </span>
                </div>
              )}

              {selectedApp.candidate?.lastWorkingDay && (
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Last Working Day</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.candidate.lastWorkingDay}
                  </span>
                </div>
              )}

              {selectedApp.candidate?.linkedinProfile && (
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block font-medium">LinkedIn Profile</span>
                  <a
                    href={
                      selectedApp.candidate.linkedinProfile.startsWith('http')
                        ? selectedApp.candidate.linkedinProfile
                        : `https://${selectedApp.candidate.linkedinProfile}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#ed7a1c] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{selectedApp.candidate.linkedinProfile}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Skills */}
            {selectedApp.candidate?.skills && selectedApp.candidate.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cover Letter
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line">
                {selectedApp.coverLetter || 'No cover letter provided.'}
              </div>
            </div>

            {/* Resume File Card */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Resume Document
              </h4>
              {selectedApp.resume?.url ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ed7a1c] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block truncate max-w-xs">
                        {selectedApp.resume.originalName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedApp.resume.size
                          ? `${(selectedApp.resume.size / (1024 * 1024)).toFixed(2)} MB • `
                          : ''}
                        {selectedApp.resume.mimeType || 'Document'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedApp.resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ed7a1c] bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                    <a
                      href={selectedApp.resume.url}
                      download={selectedApp.resume.originalName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No resume attached.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
