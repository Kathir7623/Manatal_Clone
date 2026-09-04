'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../../../services/jobService';
import Loader from '../../../../components/Loader';
import StatusBadge from '../../../../components/StatusBadge';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params?.jobId;

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId
  });

  if (isLoading) {
    return <Loader message="Loading job specifications..." />;
  }

  if (isError || !job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-sm text-slate-600 mt-2">
          {error?.message || `We couldn't locate a job with ID: ${jobId}`}
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Open Jobs
        </Link>
      </div>
    );
  }

  const isClosed = job.status === 'CLOSED';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all jobs
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400">
            {job.jobId}
          </span>
          <StatusBadge status={job.status} type="job" />
        </div>
      </div>

      {isClosed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>Notice: This position has been closed by the recruiter and is no longer accepting new submissions.</span>
        </div>
      )}

      {/* Main Document Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs text-slate-900 space-y-8 font-sans">
        {/* Header Block */}
        <div>
          <span className="text-base text-slate-700 font-medium block mb-1">
            About the job {job.title}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-4">
            Location: {job.location}
          </h1>

          <div className="space-y-1 text-sm text-slate-800">
            <div>
              <strong className="font-semibold text-slate-900">Experience:</strong>{' '}
              <span>{job.experience}</span>
            </div>
            <div>
              <strong className="font-semibold text-slate-900">Employment Type:</strong>{' '}
              <span>{job.employmentType}</span>
            </div>
            <div>
              <strong className="font-semibold text-slate-900">Openings:</strong>{' '}
              <span>{job.openings || 1}</span>
            </div>
            {job.salary && job.salary !== 'Competitive' && (
              <div>
                <strong className="font-semibold text-slate-900">Compensation:</strong>{' '}
                <span>{job.salary}</span>
              </div>
            )}
          </div>
        </div>

        {/* 1. About the Role */}
        {job.aboutRole && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-2.5">About the Role</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.aboutRole}
            </p>
          </div>
        )}

        {/* 2. Job Description */}
        <div>
          <h2 className="text-xl font-bold text-slate-950 mb-2.5">Job Description</h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* 3. Key Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Key Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 leading-relaxed marker:text-slate-800">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="pl-1">
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Required Skills */}
        {((job.skills && job.skills.length > 0) || (job.requirements && job.requirements.length > 0)) && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Required Skills</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 leading-relaxed marker:text-slate-800">
              {job.skills &&
                job.skills.map((skill, index) => (
                  <li key={`skill-${index}`} className="pl-1">
                    <span>{skill}</span>
                  </li>
                ))}
              {job.requirements &&
                job.requirements.map((req, index) => (
                  <li key={`req-${index}`} className="pl-1">
                    <span>{req}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* 5. Preferred / Good to Have */}
        {job.preferredSkills && job.preferredSkills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Preferred / Good to Have</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 leading-relaxed marker:text-slate-800">
              {job.preferredSkills.map((pref, index) => (
                <li key={index} className="pl-1">
                  <span>{pref}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Mandatory Skills */}
        {job.mandatorySkills && job.mandatorySkills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Mandatory Skills</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 leading-relaxed marker:text-slate-800">
              {job.mandatorySkills.map((mand, index) => (
                <li key={index} className="pl-1">
                  <strong className="font-semibold text-slate-900">{mand}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 7. Candidate Profile */}
        {job.candidateProfile && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-2.5">Candidate Profile</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.candidateProfile}
            </p>
          </div>
        )}

        {/* 8. Benefits Package */}
        {job.benefits && job.benefits.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Benefits Package</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 leading-relaxed marker:text-slate-800">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="pl-1">
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-8 flex justify-center">
          {isClosed ? (
            <span className="px-8 py-3 rounded-lg text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200">
              Applications Closed
            </span>
          ) : (
            <Link
              href={`/jobs/${job.jobId}/apply`}
              className="inline-flex items-center justify-center px-10 py-3 bg-[#0d6efd] hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition hover:shadow-md"
            >
              Apply for Position
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
