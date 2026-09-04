'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { jobService } from '../../../../../services/jobService';
import { applicationService } from '../../../../../services/applicationService';
import { useCandidateAuth } from '../../../../../context/CandidateAuthContext';
import Loader from '../../../../../components/Loader';
import { AlertCircle, ArrowLeft, Check } from 'lucide-react';

const CURRENCIES = [
  'INR (₹)',
  'USD ($)',
  'EUR (€)',
  'GBP (£)',
  'AED',
  'SGD ($)',
  'CAD ($)',
  'AUD ($)',
  'Barbados dollar'
];

const FREQUENCIES = ['Yearly', 'Monthly', 'Hourly'];

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId;
  const { candidateUser } = useCandidateAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Job details to confirm it exists and is OPEN
  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      currentCompany: '',
      experience: '',
      currentSalaryAmount: '',
      currentSalaryCurrency: 'INR (₹)',
      currentSalaryFrequency: 'Yearly',
      expectedSalaryAmount: '',
      expectedSalaryCurrency: 'INR (₹)',
      expectedSalaryFrequency: 'Yearly',
      currentLocation: '',
      linkedinProfile: '',
      noticePeriod: '',
      servingNoticePeriod: 'No',
      lastWorkingDay: '',
      termsAgreed: true
    }
  });

  // Auto-fill form fields if candidate is logged in
  React.useEffect(() => {
    if (candidateUser) {
      if (candidateUser.name) setValue('name', candidateUser.name);
      if (candidateUser.email) setValue('email', candidateUser.email);
      if (candidateUser.phone) setValue('phone', candidateUser.phone);
      if (candidateUser.currentLocation) setValue('currentLocation', candidateUser.currentLocation);
      if (candidateUser.experience) setValue('experience', candidateUser.experience);
    }
  }, [candidateUser, setValue]);

  const servingNoticePeriodVal = watch('servingNoticePeriod');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setFileError('Invalid file format. Please upload a PDF, DOC, or DOCX file.');
      setSelectedFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError('File size exceeds the 5 MB limit. Please upload a smaller document.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const onSubmit = async (data) => {
    setServerError('');
    setFileError('');

    if (!selectedFile) {
      setFileError('Resume is required. Please upload your resume.');
      return;
    }

    if (!data.termsAgreed) {
      setServerError('You must agree to the terms and conditions & privacy policy to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('jobId', job.jobId);
      formData.append('name', data.name);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('currentCompany', data.currentCompany);
      formData.append('experience', data.experience);
      formData.append('currentSalaryAmount', data.currentSalaryAmount);
      formData.append('currentSalaryCurrency', data.currentSalaryCurrency);
      formData.append('currentSalaryFrequency', data.currentSalaryFrequency);
      formData.append('expectedSalaryAmount', data.expectedSalaryAmount);
      formData.append('expectedSalaryCurrency', data.expectedSalaryCurrency);
      formData.append('expectedSalaryFrequency', data.expectedSalaryFrequency);
      formData.append('currentLocation', data.currentLocation);
      formData.append('linkedinProfile', data.linkedinProfile);
      formData.append('noticePeriod', data.noticePeriod);
      formData.append('servingNoticePeriod', data.servingNoticePeriod);
      formData.append('lastWorkingDay', data.lastWorkingDay || '');
      formData.append('resume', selectedFile);

      const response = await applicationService.submitApplication(formData);

      // Navigate to confirmation page
      const appId = response.data.applicationId;
      const targetUrl = `/jobs/${job.jobId}/apply/success?appId=${encodeURIComponent(appId)}&name=${encodeURIComponent(data.name)}&title=${encodeURIComponent(job.title)}&jobId=${encodeURIComponent(job.jobId)}`;
      router.push(targetUrl);
    } catch (err) {
      console.error('Submission failed:', err);
      setServerError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader message="Preparing application portal..." />;

  if (isError || !job) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">Could not locate position {jobId}.</p>
        <Link href="/jobs" className="mt-4 inline-block text-sm text-[#ed7a1c] hover:text-[#d96a12] font-semibold">
          Return to Jobs List
        </Link>
      </div>
    );
  }

  if (job.status === 'CLOSED') {
    return (
      <div className="max-w-xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-8 text-center mt-6">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-amber-900">Applications are Closed</h2>
        <p className="text-sm text-amber-700 mt-2">
          This position ({job.title}) is currently closed and no longer accepting new submissions.
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-[#ed7a1c] hover:bg-[#d96a12] text-white rounded-lg text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          View Open Positions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top back navigation */}
      <Link
        href={`/jobs/${job.jobId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {job.title}
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        {/* Header subtitle */}
        <div className="border-b border-slate-100 pb-4 mb-6">
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-orange-50 text-[#ed7a1c] border border-orange-200/60 rounded">
            {job.jobId}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Apply for {job.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Location: {job.location} • {job.employmentType}
          </p>
        </div>

        {/* Server Error Notice */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to submit application</p>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm text-slate-800">
          {/* 1. Full Name: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Full Name"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.name ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('name', { required: 'Full Name is required' })}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          {/* 2. Date of Birth: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date of Birth: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="date"
              placeholder="Date of Birth"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.dateOfBirth ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('dateOfBirth', { required: 'Date of Birth is required' })}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-rose-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* 3. Email: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.email ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          {/* 4. Phone: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Phone: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="tel"
              placeholder="Phone"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.phone ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('phone', { required: 'Phone is required' })}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
          </div>

          {/* 5. Current Company: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Company: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Current Company"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.currentCompany ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('currentCompany', { required: 'Current Company is required' })}
            />
            {errors.currentCompany && (
              <p className="mt-1 text-xs text-rose-600">{errors.currentCompany.message}</p>
            )}
          </div>

          {/* 6. Total Years of Experience: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Total Years of Experience: <span className="text-slate-900 font-bold">*</span>
            </label>
            <select
              className={`w-full rounded-md border px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.experience ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('experience', { required: 'Total Years of Experience is required' })}
            >
              <option value="">Select Years of Experience</option>
              <option value="0 - 1 Years">0 - 1 Years</option>
              <option value="1 - 3 Years">1 - 3 Years</option>
              <option value="3 - 5 Years">3 - 5 Years</option>
              <option value="5 - 7 Years">5 - 7 Years</option>
              <option value="7 - 11 Years">7 - 11 Years</option>
              <option value="11+ Years">11+ Years</option>
            </select>
            {errors.experience && (
              <p className="mt-1 text-xs text-rose-600">{errors.experience.message}</p>
            )}
          </div>

          {/* 7. Current Salary (CTC): * (Amount, Currency, Frequency) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Salary (CTC): <span className="text-slate-900 font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Current Salary (CTC)"
                className={`rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                  errors.currentSalaryAmount ? 'border-rose-400' : 'border-slate-300'
                }`}
                {...register('currentSalaryAmount', { required: 'Current Salary is required' })}
              />
              <select
                className="rounded-md border border-slate-300 px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c]"
                {...register('currentSalaryCurrency')}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-slate-300 px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c]"
                {...register('currentSalaryFrequency')}
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
            {errors.currentSalaryAmount && (
              <p className="mt-1 text-xs text-rose-600">{errors.currentSalaryAmount.message}</p>
            )}
          </div>

          {/* 8. Expected Salary (CTC): * (Amount, Currency, Frequency) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Expected Salary (CTC): <span className="text-slate-900 font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Expected Salary (CTC)"
                className={`rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                  errors.expectedSalaryAmount ? 'border-rose-400' : 'border-slate-300'
                }`}
                {...register('expectedSalaryAmount', { required: 'Expected Salary is required' })}
              />
              <select
                className="rounded-md border border-slate-300 px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c]"
                {...register('expectedSalaryCurrency')}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-slate-300 px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c]"
                {...register('expectedSalaryFrequency')}
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
            {errors.expectedSalaryAmount && (
              <p className="mt-1 text-xs text-rose-600">{errors.expectedSalaryAmount.message}</p>
            )}
          </div>

          {/* 9. Current Location: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Location: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Current Location"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.currentLocation ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('currentLocation', { required: 'Current Location is required' })}
            />
            {errors.currentLocation && (
              <p className="mt-1 text-xs text-rose-600">{errors.currentLocation.message}</p>
            )}
          </div>

          {/* 10. Linkedin Profile Link: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Linkedin Profile Link: <span className="text-slate-900 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Linkedin Profile Link"
              className={`w-full rounded-md border px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.linkedinProfile ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('linkedinProfile', { required: 'Linkedin Profile Link is required' })}
            />
            {errors.linkedinProfile && (
              <p className="mt-1 text-xs text-rose-600">{errors.linkedinProfile.message}</p>
            )}
          </div>

          {/* 11. Notice Period: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notice Period: <span className="text-slate-900 font-bold">*</span>
            </label>
            <select
              className={`w-full rounded-md border px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c] ${
                errors.noticePeriod ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...register('noticePeriod', { required: 'Notice Period is required' })}
            >
              <option value="">Select Notice Period</option>
              <option value="Immediate Joiner">Immediate Joiner</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="45 Days">45 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
            {errors.noticePeriod && (
              <p className="mt-1 text-xs text-rose-600">{errors.noticePeriod.message}</p>
            )}
          </div>

          {/* 12. Serving Notice Period: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Serving Notice Period: <span className="text-slate-900 font-bold">*</span>
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  value="Yes"
                  className="text-[#ed7a1c] focus:ring-[#ed7a1c]"
                  {...register('servingNoticePeriod')}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="radio"
                  value="No"
                  className="text-[#ed7a1c] focus:ring-[#ed7a1c]"
                  {...register('servingNoticePeriod')}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* 13. Last Working Day: */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Last Working Day:
            </label>
            <input
              type="date"
              placeholder="Last Working Day"
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#ed7a1c] focus:border-[#ed7a1c]"
              {...register('lastWorkingDay')}
            />
          </div>

          {/* 14. Resume: * */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Resume: <span className="text-slate-900 font-bold">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-slate-300 rounded-md px-3.5 py-2 text-xs bg-slate-50 text-slate-600 truncate">
                {selectedFile ? selectedFile.name : 'Choose file'}
              </div>
              <label
                htmlFor="resumeFileInput"
                className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-xs font-medium text-slate-700 shadow-2xs transition"
              >
                Browse
              </label>
              <input
                id="resumeFileInput"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {selectedFile && (
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            {fileError && <p className="mt-1 text-xs text-rose-600 font-medium">{fileError}</p>}
          </div>

          {/* 15. Checkbox terms */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-[#ed7a1c] focus:ring-[#ed7a1c]"
                {...register('termsAgreed')}
              />
              <span>
                I agree to the{' '}
                <span className="text-[#ed7a1c] font-medium hover:underline">terms and conditions</span> &{' '}
                <span className="text-[#ed7a1c] font-medium hover:underline">privacy policy</span>
              </span>
            </label>
          </div>

          {/* 16. Submit Button: [ Apply ] */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-7 py-2.5 bg-[#ed7a1c] hover:bg-[#d96a12] active:bg-[#b8540b] disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-sm transition hover:shadow-orange-500/25"
            >
              {isSubmitting ? 'Submitting Application...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
