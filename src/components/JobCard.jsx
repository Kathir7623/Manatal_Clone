import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Clock, DollarSign, ArrowRight } from 'lucide-react';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all hover:border-blue-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="inline-block text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              {job.jobId}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1.5 group-hover:text-blue-600 transition">
              {job.title}
            </h3>
          </div>
        </div>

        {/* Badges / Meta */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 my-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.employmentType}</span>
          </div>
          {job.openings && (
            <div className="flex items-center gap-1 text-slate-500">
              <span>{job.openings} {job.openings === 1 ? 'Opening' : 'Openings'}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 font-medium rounded-md"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-xs px-2 py-1 bg-slate-50 text-slate-500 font-medium rounded-md">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 font-medium">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
        <Link
          href={`/jobs/${job.jobId}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <span>View Job</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
