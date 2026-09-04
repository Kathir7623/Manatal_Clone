'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from './Input';
import Button from './Button';
import { Plus, X } from 'lucide-react';

const JobForm = ({ initialData = {}, onSubmit, isSubmitting = false, mode = 'create' }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      jobId: initialData.jobId || '',
      title: initialData.title || '',
      location: initialData.location || '',
      employmentType: initialData.employmentType || 'Full Time',
      experience: initialData.experience || '2 - 4 Years',
      openings: initialData.openings || 1,
      salary: initialData.salary || '',
      aboutRole: initialData.aboutRole || '',
      description: initialData.description || '',
      responsibilities: Array.isArray(initialData.responsibilities)
        ? initialData.responsibilities.join('\n')
        : initialData.responsibilities || '',
      requirements: Array.isArray(initialData.requirements)
        ? initialData.requirements.join('\n')
        : initialData.requirements || '',
      candidateProfile: initialData.candidateProfile || '',
      benefits: Array.isArray(initialData.benefits)
        ? initialData.benefits.join('\n')
        : initialData.benefits || '',
      status: initialData.status || 'OPEN'
    }
  });

  // Skills tag states
  const [skills, setSkills] = useState(initialData.skills || ['ServiceNow Development', 'ITSM']);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [mandatorySkills, setMandatorySkills] = useState(
    initialData.mandatorySkills || ['ServiceNow-CustomApp Development']
  );
  const [newMandatoryInput, setNewMandatoryInput] = useState('');

  const [preferredSkills, setPreferredSkills] = useState(
    initialData.preferredSkills || ['Data modeling experience', 'ServiceNow Implementation Specialist – ITSM Certification']
  );
  const [newPreferredInput, setNewPreferredInput] = useState('');

  useEffect(() => {
    if (initialData.skills) setSkills(initialData.skills);
    if (initialData.mandatorySkills) setMandatorySkills(initialData.mandatorySkills);
    if (initialData.preferredSkills) setPreferredSkills(initialData.preferredSkills);
  }, [initialData]);

  const handleAddTag = (e, list, setList, inputVal, setInputVal) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInputVal('');
    }
  };

  const handleRemoveTag = (itemToRemove, list, setList) => {
    setList(list.filter((item) => item !== itemToRemove));
  };

  const onFormSubmit = (data) => {
    const payload = {
      ...data,
      jobId: data.jobId && data.jobId.trim() !== '' ? data.jobId.trim() : undefined,
      openings: parseInt(data.openings, 10) || 1,
      skills,
      mandatorySkills,
      preferredSkills,
      responsibilities: data.responsibilities
        ? data.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
        : [],
      requirements: data.requirements
        ? data.requirements.split('\n').map((r) => r.trim()).filter(Boolean)
        : [],
      benefits: data.benefits
        ? data.benefits.split('\n').map((b) => b.trim()).filter(Boolean)
        : []
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* SECTION 1: Core Header Attributes */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          1. Position Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-1">
            <Input
              label="Job ID"
              placeholder="e.g. JOB-2026-0005 or VIV-DEV-01"
              helperText={
                mode === 'create'
                  ? 'Optional. Leave blank to auto-generate.'
                  : 'Unique identifier (read-only)'
              }
              disabled={mode === 'edit'}
              className={
                mode === 'edit'
                  ? 'bg-slate-50 text-slate-500 font-mono cursor-not-allowed'
                  : 'font-mono'
              }
              error={errors.jobId?.message}
              {...register('jobId')}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Job Title"
              required
              placeholder="e.g. Contractor - ServiceNow Sr Developer"
              error={errors.title?.message}
              {...register('title', { required: 'Job title is required' })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
          <Input
            label="Location"
            required
            placeholder="e.g. Coimbatore, Hyderabad, or Remote"
            error={errors.location?.message}
            {...register('location', { required: 'Location is required' })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Employment Type <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition text-slate-800"
              {...register('employmentType', { required: true })}
            >
              <option value="Sub-contractor">Sub-contractor</option>
              <option value="Contract">Contract</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          <div>
            <Input
              label="Experience"
              required
              placeholder="e.g. 7-11 Years or 2 - 4 Years"
              error={errors.experience?.message}
              {...register('experience', { required: 'Experience is required' })}
            />
          </div>

          <div>
            <Input
              label="Openings"
              type="number"
              min="1"
              required
              placeholder="1"
              {...register('openings', { required: true })}
            />
          </div>

          <div>
            <Input
              label="Compensation / Salary"
              placeholder="Competitive or Hourly"
              {...register('salary')}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: About the Role & Description */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          2. Role Context & Description
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              About the Role
            </label>
            <textarea
              rows={3}
              placeholder="We are seeking a ServiceNow Senior Developer with strong hands-on experience in ServiceNow development, customization, scripting, workflows..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition"
              {...register('aboutRole')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="The role involves designing, developing, implementing, customizing, and maintaining solutions based on business requirements..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition"
              {...register('description', { required: 'Job description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Key Responsibilities */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
          3. Key Responsibilities
        </h3>
        <p className="text-xs text-slate-500 mb-2">Enter one responsibility per line.</p>
        <textarea
          rows={5}
          placeholder="Develop and customize ServiceNow applications, workflows, scripts, and business processes.&#10;Design, implement, and enhance solutions based on customer requirements.&#10;Handle incidents, problems, changes, and service requests within the platform.&#10;Design and develop end-to-end integrations between ServiceNow and external systems."
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition font-mono text-xs"
          {...register('responsibilities')}
        />
      </div>

      {/* SECTION 4: Skills Matrix (Mandatory, Required, Preferred) */}
      <div className="border-b border-slate-100 pb-4 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          4. Skills Matrix
        </h3>

        {/* Mandatory Skills */}
        <div>
          <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5">
            Mandatory Skills
          </label>
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-200">
            {mandatorySkills.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-rose-200 text-xs font-bold text-rose-800 rounded-lg shadow-2xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag, mandatorySkills, setMandatorySkills)}
                  className="text-rose-400 hover:text-rose-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="+ Add mandatory skill"
                value={newMandatoryInput}
                onChange={(e) => setNewMandatoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e, mandatorySkills, setMandatorySkills, newMandatoryInput, setNewMandatoryInput);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-md border border-rose-300 bg-white focus:outline-none focus:border-rose-500 w-44"
              />
              <button
                type="button"
                onClick={(e) =>
                  handleAddTag(e, mandatorySkills, setMandatorySkills, newMandatoryInput, setNewMandatoryInput)
                }
                className="p-1 text-rose-700 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-xs font-bold text-[#ed7a1c] uppercase tracking-wider mb-1.5">
            Required Skills
          </label>
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-orange-50/50 rounded-xl border border-orange-200">
            {skills.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-orange-200 text-xs font-semibold text-orange-800 rounded-lg shadow-2xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag, skills, setSkills)}
                  className="text-orange-400 hover:text-orange-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="+ Add required skill"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e, skills, setSkills, newSkillInput, setNewSkillInput);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-md border border-orange-300 bg-white focus:outline-none focus:border-[#ed7a1c] w-40"
              />
              <button
                type="button"
                onClick={(e) => handleAddTag(e, skills, setSkills, newSkillInput, setNewSkillInput)}
                className="p-1 text-[#ed7a1c] font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Preferred / Good to Have Skills */}
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
            Preferred / Good to Have
          </label>
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
            {preferredSkills.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-lg shadow-2xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag, preferredSkills, setPreferredSkills)}
                  className="text-emerald-400 hover:text-emerald-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="+ Add preferred skill"
                value={newPreferredInput}
                onChange={(e) => setNewPreferredInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e, preferredSkills, setPreferredSkills, newPreferredInput, setNewPreferredInput);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-md border border-emerald-300 bg-white focus:outline-none focus:border-emerald-500 w-44"
              />
              <button
                type="button"
                onClick={(e) =>
                  handleAddTag(e, preferredSkills, setPreferredSkills, newPreferredInput, setNewPreferredInput)
                }
                className="p-1 text-emerald-700 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Candidate Profile & Benefits */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          5. Candidate Profile & Benefits Package
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Candidate Profile
          </label>
          <textarea
            rows={3}
            placeholder="The ideal candidate should have 7–11 years of overall IT experience, with approximately 5 years of hands-on ServiceNow development, implementation, and enhancement experience..."
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition"
            {...register('candidateProfile')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Benefits Package (One per line)
          </label>
          <textarea
            rows={4}
            placeholder="Competitive salary and benefits package&#10;Opportunities for professional growth and development&#10;A collaborative and inclusive work environment&#10;The opportunity to work on exciting and challenging projects with leading clients"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ed7a1c] transition font-mono text-xs"
            {...register('benefits')}
          />
        </div>
      </div>

      {/* Submit Controls */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {mode === 'create' ? 'Create Job Position' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
