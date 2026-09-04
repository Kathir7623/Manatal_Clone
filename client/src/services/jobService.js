import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper to normalize Supabase snake_case columns to frontend camelCase
export const normalizeJob = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    jobId: row.job_id || row.jobId,
    title: row.title,
    description: row.description,
    location: row.location,
    employmentType: row.employment_type || row.employmentType || 'Full Time',
    experience: row.experience,
    openings: row.openings || 1,
    salary: row.salary || 'Competitive',
    aboutRole: row.about_role || row.aboutRole || '',
    candidateProfile: row.candidate_profile || row.candidateProfile || '',
    skills: row.skills || [],
    mandatorySkills: row.mandatory_skills || row.mandatorySkills || [],
    preferredSkills: row.preferred_skills || row.preferredSkills || [],
    responsibilities: row.responsibilities || [],
    requirements: row.requirements || [],
    benefits: row.benefits || [],
    status: row.status || 'OPEN',
    isDeleted: row.is_deleted ?? row.isDeleted ?? false,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    applicationCount: row.application_count ?? row.applicationCount ?? 0
  };
};

// Initial in-memory/localStorage seed jobs for local offline testing
const INITIAL_DEMO_JOBS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    job_id: 'JOB-2026-0001',
    title: 'Contractor - ServiceNow Sr Developer',
    description: 'Lead technical design, development, and implementation of ServiceNow modules and custom integrations.',
    location: 'Coimbatore / Remote',
    employment_type: 'Contract',
    experience: '7 - 11 Years',
    openings: 2,
    salary: '₹22-28 LPA',
    about_role: 'We are seeking a senior ServiceNow developer with hands-on expertise in custom scoped applications.',
    skills: ['ServiceNow', 'ITSM', 'JavaScript', 'REST APIs', 'Service Portal'],
    mandatory_skills: ['ServiceNow-CustomApp Development', 'ITSM Suite'],
    preferred_skills: ['Certified Implementation Specialist', 'Data Modeling'],
    responsibilities: [
      'Architect and implement scalable ServiceNow solutions.',
      'Build and maintain complex REST/SOAP integrations.',
      'Lead technical code reviews and platform upgrades.'
    ],
    requirements: [
      '7+ years in enterprise IT application development.',
      'Proven track record implementing ServiceNow ITSM/ITOM modules.'
    ],
    benefits: ['Flexible Working Hours', 'Remote Setup Allowance', 'Certification Sponsorship'],
    status: 'OPEN',
    is_deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    job_id: 'JOB-2026-0002',
    title: 'Senior Full Stack Engineer (Next.js & Node.js)',
    description: 'Build and optimize performant, modern web applications powering digital talent and enterprise ATS operations.',
    location: 'Coimbatore',
    employment_type: 'Full Time',
    experience: '3 - 6 Years',
    openings: 3,
    salary: '₹14-18 LPA',
    about_role: 'Join our core engineering team in Coimbatore crafting resilient digital recruitment tools.',
    skills: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    mandatory_skills: ['Next.js App Router', 'PostgreSQL / SQL'],
    preferred_skills: ['Supabase experience', 'TypeScript'],
    responsibilities: [
      'Design and deliver high-performance user interfaces in Next.js.',
      'Maintain SQL data layer and secure API endpoints.'
    ],
    requirements: [
      'Strong foundation in JavaScript/TypeScript and SQL databases.',
      'Deep understanding of SSR and client state management.'
    ],
    benefits: ['Health Insurance', 'Performance Bonus', 'Learning Stipend'],
    status: 'OPEN',
    is_deleted: false,
    created_at: new Date().toISOString()
  }
];

const getLocalJobs = () => {
  if (typeof window === 'undefined') return INITIAL_DEMO_JOBS;
  const stored = localStorage.getItem('vivantify_jobs');
  if (!stored) {
    localStorage.setItem('vivantify_jobs', JSON.stringify(INITIAL_DEMO_JOBS));
    return INITIAL_DEMO_JOBS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DEMO_JOBS;
  }
};

const saveLocalJobs = (jobs) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vivantify_jobs', JSON.stringify(jobs));
  }
};

export const jobService = {
  // 1. Fetch public active jobs
  getPublicJobs: async (params = {}) => {
    const { search = '', location = '', experience = '', employmentType = '', page = 1, limit = 9 } = params;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('status', 'OPEN')
        .eq('is_deleted', false);

      if (search && search.trim() !== '') {
        const term = search.trim();
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`);
      }
      if (location && location !== 'ALL' && location.trim() !== '') {
        query = query.ilike('location', `%${location.trim()}%`);
      }
      if (experience && experience !== 'ALL' && experience.trim() !== '') {
        query = query.ilike('experience', `%${experience.trim()}%`);
      }
      if (employmentType && employmentType !== 'ALL' && employmentType.trim() !== '') {
        query = query.eq('employment_type', employmentType.trim());
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      return {
        jobs: (data || []).map(normalizeJob),
        total: count || 0,
        page: Number(page),
        totalPages: Math.ceil((count || 0) / limit) || 1
      };
    }

    // Fallback: Local Storage
    let filtered = getLocalJobs().filter((j) => j.status === 'OPEN' && !j.is_deleted);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          j.description.toLowerCase().includes(s) ||
          j.location.toLowerCase().includes(s)
      );
    }
    if (location && location !== 'ALL') {
      filtered = filtered.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (experience && experience !== 'ALL') {
      filtered = filtered.filter((j) => j.experience.toLowerCase().includes(experience.toLowerCase()));
    }
    if (employmentType && employmentType !== 'ALL') {
      filtered = filtered.filter((j) => j.employment_type === employmentType);
    }

    const total = filtered.length;
    const from = (page - 1) * limit;
    const paginated = filtered.slice(from, from + limit);

    return {
      jobs: paginated.map(normalizeJob),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  // 2. Fetch admin jobs with applicant counts
  getAdminJobs: async (params = {}) => {
    const { search = '', status = 'ALL', page = 1, limit = 10 } = params;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('jobs')
        .select('*, applications(count)', { count: 'exact' })
        .eq('is_deleted', false);

      if (search && search.trim() !== '') {
        const term = search.trim();
        query = query.or(`title.ilike.%${term}%,job_id.ilike.%${term}%,location.ilike.%${term}%`);
      }
      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      const mapped = (data || []).map((row) => ({
        ...normalizeJob(row),
        applicationCount: row.applications?.[0]?.count || 0
      }));

      return {
        jobs: mapped,
        total: count || 0,
        page: Number(page),
        totalPages: Math.ceil((count || 0) / limit) || 1
      };
    }

    // Fallback: Local Storage
    let filtered = getLocalJobs().filter((j) => !j.is_deleted);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          j.job_id.toLowerCase().includes(s) ||
          j.location.toLowerCase().includes(s)
      );
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter((j) => j.status === status);
    }

    const total = filtered.length;
    const from = (page - 1) * limit;
    const paginated = filtered.slice(from, from + limit);

    return {
      jobs: paginated.map(normalizeJob),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  // 3. Fetch single job by ID or Job ID
  getJobById: async (jobId) => {
    if (isSupabaseConfigured) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
      const query = supabase
        .from('jobs')
        .select('*')
        .eq('is_deleted', false);

      const { data, error } = isUuid
        ? await query.eq('id', jobId).maybeSingle()
        : await query.eq('job_id', jobId).maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error(`Job with ID '${jobId}' not found.`);

      return normalizeJob(data);
    }

    // Fallback
    const found = getLocalJobs().find(
      (j) => !j.is_deleted && (j.id === jobId || j.job_id === jobId)
    );
    if (!found) throw new Error(`Job with ID '${jobId}' not found.`);
    return normalizeJob(found);
  },

  // 4. Create new job (Supports custom Job ID or auto sequence)
  createJob: async (jobData) => {
    let finalJobId = jobData.jobId && jobData.jobId.trim() !== '' ? jobData.jobId.trim() : null;

    if (isSupabaseConfigured) {
      if (finalJobId) {
        // Validate custom Job ID uniqueness
        const { data: existing } = await supabase
          .from('jobs')
          .select('id')
          .eq('job_id', finalJobId)
          .maybeSingle();

        if (existing) {
          throw new Error(`A job with Job ID '${finalJobId}' already exists. Please choose a unique Job ID.`);
        }
      }

      const row = {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        location: jobData.location.trim(),
        employment_type: jobData.employmentType || 'Full Time',
        experience: jobData.experience.trim(),
        openings: Math.max(1, parseInt(jobData.openings, 10) || 1),
        salary: jobData.salary?.trim() || 'Competitive',
        about_role: jobData.aboutRole?.trim() || '',
        candidate_profile: jobData.candidateProfile?.trim() || '',
        skills: jobData.skills || [],
        mandatory_skills: jobData.mandatorySkills || [],
        preferred_skills: jobData.preferredSkills || [],
        responsibilities: jobData.responsibilities || [],
        requirements: jobData.requirements || [],
        benefits: jobData.benefits || [],
        status: jobData.status || 'OPEN',
        is_deleted: false
      };

      if (finalJobId) {
        row.job_id = finalJobId;
      }

      const { data, error } = await supabase.from('jobs').insert(row).select().single();
      if (error) throw new Error(error.message);

      return { data: normalizeJob(data) };
    }

    // Fallback: Local Storage
    const allJobs = getLocalJobs();
    if (!finalJobId) {
      const year = new Date().getFullYear();
      const count = allJobs.length + 1;
      finalJobId = `JOB-${year}-${String(count).padStart(4, '0')}`;
    } else {
      const exists = allJobs.find((j) => j.job_id.toLowerCase() === finalJobId.toLowerCase());
      if (exists) {
        throw new Error(`A job with Job ID '${finalJobId}' already exists. Please choose a unique Job ID.`);
      }
    }

    const newJob = {
      id: crypto.randomUUID(),
      job_id: finalJobId,
      title: jobData.title.trim(),
      description: jobData.description.trim(),
      location: jobData.location.trim(),
      employment_type: jobData.employmentType || 'Full Time',
      experience: jobData.experience.trim(),
      openings: Math.max(1, parseInt(jobData.openings, 10) || 1),
      salary: jobData.salary?.trim() || 'Competitive',
      about_role: jobData.aboutRole?.trim() || '',
      candidate_profile: jobData.candidateProfile?.trim() || '',
      skills: jobData.skills || [],
      mandatory_skills: jobData.mandatorySkills || [],
      preferred_skills: jobData.preferredSkills || [],
      responsibilities: jobData.responsibilities || [],
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      status: jobData.status || 'OPEN',
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    allJobs.unshift(newJob);
    saveLocalJobs(allJobs);

    return { data: normalizeJob(newJob) };
  },

  // 5. Update job details
  updateJob: async (jobId, jobData) => {
    if (isSupabaseConfigured) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
      const row = {
        title: jobData.title?.trim(),
        description: jobData.description?.trim(),
        location: jobData.location?.trim(),
        employment_type: jobData.employmentType,
        experience: jobData.experience?.trim(),
        openings: parseInt(jobData.openings, 10) || 1,
        salary: jobData.salary?.trim(),
        about_role: jobData.aboutRole?.trim(),
        candidate_profile: jobData.candidateProfile?.trim(),
        skills: jobData.skills,
        mandatory_skills: jobData.mandatorySkills,
        preferred_skills: jobData.preferredSkills,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        updated_at: new Date().toISOString()
      };

      const query = supabase.from('jobs').update(row);
      const { data, error } = isUuid
        ? await query.eq('id', jobId).select().single()
        : await query.eq('job_id', jobId).select().single();

      if (error) throw new Error(error.message);
      return { data: normalizeJob(data) };
    }

    // Fallback
    const allJobs = getLocalJobs();
    const idx = allJobs.findIndex((j) => j.id === jobId || j.job_id === jobId);
    if (idx === -1) throw new Error(`Job '${jobId}' not found.`);

    allJobs[idx] = {
      ...allJobs[idx],
      title: jobData.title?.trim() || allJobs[idx].title,
      description: jobData.description?.trim() || allJobs[idx].description,
      location: jobData.location?.trim() || allJobs[idx].location,
      employment_type: jobData.employmentType || allJobs[idx].employment_type,
      experience: jobData.experience?.trim() || allJobs[idx].experience,
      openings: parseInt(jobData.openings, 10) || allJobs[idx].openings,
      salary: jobData.salary?.trim() || allJobs[idx].salary,
      about_role: jobData.aboutRole?.trim() || allJobs[idx].about_role,
      candidate_profile: jobData.candidateProfile?.trim() || allJobs[idx].candidate_profile,
      skills: jobData.skills || allJobs[idx].skills,
      mandatory_skills: jobData.mandatorySkills || allJobs[idx].mandatory_skills,
      preferred_skills: jobData.preferredSkills || allJobs[idx].preferred_skills,
      responsibilities: jobData.responsibilities || allJobs[idx].responsibilities,
      requirements: jobData.requirements || allJobs[idx].requirements,
      benefits: jobData.benefits || allJobs[idx].benefits,
      updated_at: new Date().toISOString()
    };
    saveLocalJobs(allJobs);

    return { data: normalizeJob(allJobs[idx]) };
  },

  // 6. Toggle job status
  updateJobStatus: async (jobId, status) => {
    if (isSupabaseConfigured) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
      const query = supabase.from('jobs').update({ status, updated_at: new Date().toISOString() });
      const { data, error } = isUuid
        ? await query.eq('id', jobId).select().single()
        : await query.eq('job_id', jobId).select().single();

      if (error) throw new Error(error.message);
      return { data: normalizeJob(data) };
    }

    const allJobs = getLocalJobs();
    const idx = allJobs.findIndex((j) => j.id === jobId || j.job_id === jobId);
    if (idx === -1) throw new Error(`Job '${jobId}' not found.`);
    allJobs[idx].status = status;
    saveLocalJobs(allJobs);
    return { data: normalizeJob(allJobs[idx]) };
  },

  // 7. Soft delete job
  deleteJob: async (jobId) => {
    if (isSupabaseConfigured) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
      const query = supabase.from('jobs').update({ is_deleted: true, updated_at: new Date().toISOString() });
      const { error } = isUuid
        ? await query.eq('id', jobId)
        : await query.eq('job_id', jobId);

      if (error) throw new Error(error.message);
      return { success: true };
    }

    const allJobs = getLocalJobs();
    const idx = allJobs.findIndex((j) => j.id === jobId || j.job_id === jobId);
    if (idx !== -1) {
      allJobs[idx].is_deleted = true;
      saveLocalJobs(allJobs);
    }
    return { success: true };
  },

  // 8. Real-time Recruiter Analytics
  getDashboardStats: async () => {
    if (isSupabaseConfigured) {
      const [
        { count: totalJobs },
        { count: openJobs },
        { count: closedJobs },
        { count: totalApplications },
        { count: newApplications },
        { count: shortlistedCandidates },
        { data: recentJobs },
        { data: recentApps }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'OPEN').eq('is_deleted', false),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'CLOSED').eq('is_deleted', false),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'NEW'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'SHORTLISTED'),
        supabase.from('jobs').select('*, applications(count)').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('applications').select('*, candidates(name), jobs(title)').order('created_at', { ascending: false }).limit(5)
      ]);

      return {
        totalJobs: totalJobs || 0,
        openJobs: openJobs || 0,
        closedJobs: closedJobs || 0,
        totalApplications: totalApplications || 0,
        newApplications: newApplications || 0,
        shortlistedCandidates: shortlistedCandidates || 0,
        recentJobs: (recentJobs || []).map((j) => ({
          ...normalizeJob(j),
          applicationCount: j.applications?.[0]?.count || 0
        })),
        recentApplications: (recentApps || []).map((a) => ({
          _id: a.id,
          applicationId: a.application_id,
          status: a.status,
          createdAt: a.created_at,
          candidate: { name: a.candidates?.name || 'Applicant' },
          job: { title: a.jobs?.title || 'Position' }
        }))
      };
    }

    // Fallback: Local Storage Stats
    const jobs = getLocalJobs().filter((j) => !j.is_deleted);
    const apps = (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('vivantify_applications') || '[]')) || [];

    return {
      totalJobs: jobs.length,
      openJobs: jobs.filter((j) => j.status === 'OPEN').length,
      closedJobs: jobs.filter((j) => j.status === 'CLOSED').length,
      totalApplications: apps.length,
      newApplications: apps.filter((a) => a.status === 'NEW').length,
      shortlistedCandidates: apps.filter((a) => a.status === 'SHORTLISTED').length,
      recentJobs: jobs.slice(0, 5).map(normalizeJob),
      recentApplications: apps.slice(0, 5)
    };
  }
};
