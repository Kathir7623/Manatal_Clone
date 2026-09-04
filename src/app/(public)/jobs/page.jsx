'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../../services/jobService';
import JobCard from '../../../components/JobCard';
import Pagination from '../../../components/Pagination';
import Loader from '../../../components/Loader';
import { Search, MapPin, Filter, RefreshCw } from 'lucide-react';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // TanStack Query for server state
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['publicJobs', { search: searchTerm, location: locationFilter, experience: experienceFilter, employmentType: employmentTypeFilter, page }],
    queryFn: () =>
      jobService.getPublicJobs({
        search: searchTerm,
        location: locationFilter,
        experience: experienceFilter,
        employmentType: employmentTypeFilter,
        page,
        limit: 9
      })
  });

  const jobs = data?.jobs || [];
  const totalPages = data?.totalPages || 1;
  const totalJobs = data?.total || 0;

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setExperienceFilter('');
    setEmploymentTypeFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto pt-4 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Available Opportunities
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Explore our open roles and take the next step in your professional journey.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search jobs, skills..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Location (e.g. Remote)"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Employment Type Filter */}
          <div>
            <select
              value={employmentTypeFilter}
              onChange={(e) => {
                setEmploymentTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-slate-700"
            >
              <option value="">All Employment Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={experienceFilter}
              onChange={(e) => {
                setExperienceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-slate-700"
            >
              <option value="">All Experience Levels</option>
              <option value="0 - 1">0 - 1 Years (Entry Level)</option>
              <option value="2 - 4">2 - 4 Years (Mid Level)</option>
              <option value="3 - 5">3 - 5 Years</option>
              <option value="5+">5+ Years (Senior)</option>
            </select>
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{jobs.length}</strong> of{' '}
            <strong className="text-slate-800">{totalJobs}</strong> open positions
          </span>

          {(searchTerm || locationFilter || experienceFilter || employmentTypeFilter) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <Loader message="Loading available positions..." />
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700">
          <p className="font-semibold">Unable to fetch jobs</p>
          <p className="text-xs mt-1 text-rose-600">{error?.message || 'Server error'}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No open jobs found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or removing filters to see available opportunities.
          </p>
          {(searchTerm || locationFilter || experienceFilter || employmentTypeFilter) && (
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium text-xs hover:bg-blue-100 transition"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id || job.jobId} job={job} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalJobs}
            pageSize={9}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
}
