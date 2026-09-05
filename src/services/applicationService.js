import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Helper to normalize application row
export const normalizeApplication = (row) => {
  if (!row) return null;
  const resumeUrl =
    row.resume_url ||
    row.resumeUrl ||
    (row.resume && typeof row.resume === 'object' ? row.resume.url : '') ||
    '';
  const resumeFilename =
    row.resume_filename ||
    row.resumeFilename ||
    (row.resume && typeof row.resume === 'object' ? row.resume.originalName : '') ||
    'Resume.pdf';
  const resumeSize =
    row.resume_size ||
    (row.resume && typeof row.resume === 'object' ? row.resume.size : null);
  const resumeMime =
    row.resume_mime_type ||
    (row.resume && typeof row.resume === 'object' ? row.resume.mimeType : 'application/pdf');

  const cand = row.candidates || row.candidate || {};
  const exp =
    cand.total_experience ||
    cand.totalExperience ||
    cand.experience ||
    '';

  const curCtc =
    cand.current_ctc ||
    cand.currentCtc ||
    (cand.currentSalary && cand.currentSalary.amount
      ? `${cand.currentSalary.amount} ${cand.currentSalary.currency || ''} / ${cand.currentSalary.frequency || ''}`
      : '');

  const expCtc =
    cand.expected_ctc ||
    cand.expectedCtc ||
    (cand.expectedSalary && cand.expectedSalary.amount
      ? `${cand.expectedSalary.amount} ${cand.expectedSalary.currency || ''} / ${cand.expectedSalary.frequency || ''}`
      : '');

  const lkIn =
    cand.linkedin_url ||
    cand.linkedinUrl ||
    cand.linkedinProfile ||
    '';

  let metadata = {};
  if (row.cover_letter) {
    try {
      if (typeof row.cover_letter === 'string' && row.cover_letter.startsWith('{')) {
        metadata = JSON.parse(row.cover_letter);
      }
    } catch {
      metadata = {};
    }
  }

  const panCard =
    cand.pan_card ||
    cand.panCard ||
    row.pan_card ||
    row.panCard ||
    metadata.panCard ||
    '';

  const panCardUrl =
    cand.pan_card_url ||
    cand.panCardUrl ||
    row.pan_card_url ||
    row.panCardUrl ||
    metadata.panCardUrl ||
    '';

  const panCardFilename =
    cand.pan_card_filename ||
    cand.panCardFilename ||
    row.pan_card_filename ||
    row.panCardFilename ||
    metadata.panCardFilename ||
    '';

  const dob =
    cand.date_of_birth ||
    cand.dateOfBirth ||
    metadata.dateOfBirth ||
    '';

  return {
    _id: row.id,
    id: row.id,
    applicationId: row.application_id || row.applicationId,
    status: row.status || 'NEW',
    coverLetter: metadata.coverLetter || (typeof row.cover_letter === 'string' && !row.cover_letter.startsWith('{') ? row.cover_letter : ''),
    panCard,
    panCardUrl,
    panCardFilename,
    resumeUrl: resumeUrl,
    resumeFilename: resumeFilename,
    resume: resumeUrl
      ? {
          url: resumeUrl,
          originalName: resumeFilename,
          size: resumeSize,
          mimeType: resumeMime
        }
      : null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    candidate: {
      _id: cand.id || cand._id,
      name: cand.name || 'Candidate',
      email: cand.email || '',
      phone: cand.phone || '',
      panCard,
      panCardUrl,
      panCardFilename,
      dateOfBirth: dob,
      experience: exp || 'N/A',
      totalExperience: exp || 'N/A',
      currentLocation: cand.current_location || cand.currentLocation || '',
      currentCompany: cand.current_company || cand.currentCompany || '',
      currentCtc: curCtc,
      currentSalary: curCtc ? { amount: curCtc } : null,
      expectedCtc: expCtc,
      expectedSalary: expCtc ? { amount: expCtc } : null,
      noticePeriod: cand.notice_period || cand.noticePeriod || '',
      servingNoticePeriod: cand.serving_notice_period || cand.servingNoticePeriod || metadata.servingNoticePeriod || '',
      lastWorkingDay: cand.last_working_day || cand.lastWorkingDay || metadata.lastWorkingDay || '',
      portfolioUrl: cand.portfolio_url || cand.portfolioUrl || '',
      linkedinProfile: lkIn,
      linkedinUrl: lkIn,
      skills: cand.skills || []
    },
    job: row.jobs
      ? {
          _id: row.jobs.id,
          jobId: row.jobs.job_id,
          title: row.jobs.title,
          location: row.jobs.location,
          employmentType: row.jobs.employment_type
        }
      : row.job || {}
  };
};

const getLocalApplications = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('vivantify_applications') || '[]');
  } catch {
    return [];
  }
};

const saveLocalApplications = (apps) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vivantify_applications', JSON.stringify(apps));
  }
};

export const applicationService = {
  // 1. Submit Candidate Application
  submitApplication: async (formData) => {
    // Read parameters whether passed as FormData or plain object
    let jobId, name, email, phone, dateOfBirth, panCard, totalExperience, currentLocation, currentCompany, currentCtc, expectedCtc, noticePeriod, servingNoticePeriod, lastWorkingDay, portfolioUrl, linkedinUrl, coverLetter, resumeFile;

    if (typeof FormData !== 'undefined' && formData instanceof FormData) {
      jobId = formData.get('jobId');
      name = formData.get('name');
      dateOfBirth = formData.get('dateOfBirth') || '';
      email = formData.get('email');
      phone = formData.get('phone');
      panCard = formData.get('panCard') || '';
      totalExperience = formData.get('experience') || formData.get('totalExperience') || '';
      currentLocation = formData.get('currentLocation') || '';
      currentCompany = formData.get('currentCompany') || '';
      const curAmt = formData.get('currentSalaryAmount');
      currentCtc = curAmt
        ? `${curAmt} ${formData.get('currentSalaryCurrency') || ''} / ${formData.get('currentSalaryFrequency') || ''}`
        : (formData.get('currentCtc') || '');
      const expAmt = formData.get('expectedSalaryAmount');
      expectedCtc = expAmt
        ? `${expAmt} ${formData.get('expectedSalaryCurrency') || ''} / ${formData.get('expectedSalaryFrequency') || ''}`
        : (formData.get('expectedCtc') || '');
      let np = formData.get('noticePeriod') || '';
      const serving = formData.get('servingNoticePeriod');
      servingNoticePeriod = serving || '';
      if (serving) {
        np = `${np} (Serving: ${serving})`;
      }
      noticePeriod = np;
      lastWorkingDay = formData.get('lastWorkingDay') || '';
      portfolioUrl = formData.get('portfolioUrl') || '';
      linkedinUrl = formData.get('linkedinProfile') || formData.get('linkedinUrl') || '';
      coverLetter = formData.get('coverLetter') || '';
      resumeFile = formData.get('resume');
    } else {
      ({ jobId, name, dateOfBirth, email, phone, panCard, totalExperience, currentLocation, currentCompany, currentCtc, expectedCtc, noticePeriod, servingNoticePeriod, lastWorkingDay, portfolioUrl, linkedinUrl, coverLetter, resume: resumeFile } = formData);
    }

    if (!jobId || !name || !email || !phone) {
      throw new Error('Please fill in all required application fields.');
    }

    const cleanPan = panCard ? panCard.trim().toUpperCase() : '';

    if (isSupabaseConfigured) {
      // Step A: Find the target job
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
      const { data: targetJob, error: jobErr } = isUuid
        ? await supabase.from('jobs').select('id, job_id, title').eq('id', jobId).maybeSingle()
        : await supabase.from('jobs').select('id, job_id, title').eq('job_id', jobId).maybeSingle();

      if (jobErr || !targetJob) {
        throw new Error('Target job opening not found or has been closed.');
      }

      // Step B: Upload resume to Supabase Storage 'resumes' bucket
      let resumeUrl = 'https://placeholder.supabase.co/resume.pdf';
      let resumeFilename = resumeFile?.name || 'Resume.pdf';

      if (resumeFile && typeof resumeFile !== 'string') {
        const fileExt = resumeFile.name.split('.').pop();
        const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('resumes')
          .upload(safeName, resumeFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
          resumeUrl = urlData.publicUrl;
          resumeFilename = resumeFile.name;
        }
      }

      // Construct metadata JSON payload for fields not in default Postgres schema
      const metadataPayload = JSON.stringify({
        panCard: cleanPan,
        dateOfBirth: dateOfBirth || '',
        servingNoticePeriod: servingNoticePeriod || '',
        lastWorkingDay: lastWorkingDay || '',
        coverLetter: coverLetter || ''
      });

      // Step C: Upsert candidate in 'candidates' table
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          total_experience: totalExperience || '',
          current_location: currentLocation || '',
          current_company: currentCompany || '',
          current_ctc: currentCtc || '',
          expected_ctc: expectedCtc || '',
          notice_period: noticePeriod || '',
          portfolio_url: portfolioUrl || '',
          linkedin_url: linkedinUrl || ''
        })
        .select()
        .single();

      if (candErr) throw new Error(candErr.message);

      // Step D: Insert into 'applications' table
      const { data: application, error: appErr } = await supabase
        .from('applications')
        .insert({
          job_id: targetJob.id,
          candidate_id: candidate.id,
          resume_url: resumeUrl,
          resume_filename: resumeFilename,
          cover_letter: metadataPayload,
          status: 'NEW'
        })
        .select('*, candidates(*), jobs(*)')
        .single();

      if (appErr) {
        if (appErr.code === '23505') {
          throw new Error('You have already submitted an application for this position.');
        }
        throw new Error(appErr.message);
      }

      return {
        data: {
          application: normalizeApplication(application),
          applicationId: application.application_id
        }
      };
    }

    // Fallback: Local Storage Mode
    const year = new Date().getFullYear();
    const existingApps = getLocalApplications();
    const appId = `APP-${year}-${String(existingApps.length + 1).padStart(4, '0')}`;

    // Read stored jobs to link job details
    const storedJobs = (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('vivantify_jobs') || '[]')) || [];
    const matchedJob = storedJobs.find((j) => j.id === jobId || j.job_id === jobId) || {
      job_id: jobId,
      title: 'Open Position'
    };

    let fallbackResumeUrl = '#';
    try {
      if (typeof window !== 'undefined' && resumeFile instanceof File) {
        fallbackResumeUrl = URL.createObjectURL(resumeFile);
      }
    } catch {
      fallbackResumeUrl = '#';
    }

    const metadataPayload = JSON.stringify({
      panCard: cleanPan,
      dateOfBirth: dateOfBirth || '',
      servingNoticePeriod: servingNoticePeriod || '',
      lastWorkingDay: lastWorkingDay || '',
      coverLetter: coverLetter || ''
    });

    const newApp = {
      id: crypto.randomUUID(),
      application_id: appId,
      status: 'NEW',
      cover_letter: metadataPayload,
      panCard: cleanPan,
      resume_url: fallbackResumeUrl,
      resume_filename: resumeFile?.name || 'Resume.pdf',
      created_at: new Date().toISOString(),
      candidate: {
        name,
        email,
        phone,
        panCard: cleanPan,
        dateOfBirth: dateOfBirth || '',
        totalExperience,
        experience: totalExperience,
        currentLocation,
        currentCompany,
        currentCtc,
        expectedCtc,
        noticePeriod,
        servingNoticePeriod: servingNoticePeriod || '',
        lastWorkingDay: lastWorkingDay || '',
        portfolioUrl,
        linkedinUrl,
        linkedinProfile: linkedinUrl
      },
      job: {
        jobId: matchedJob.job_id || jobId,
        title: matchedJob.title || 'Position'
      }
    };

    existingApps.unshift(newApp);
    saveLocalApplications(existingApps);

    return {
      data: {
        application: normalizeApplication(newApp),
        applicationId: appId
      }
    };
  },

  // 2. Fetch all applications (Global Admin review)
  getAllApplications: async (params = {}) => {
    const { search = '', status = 'ALL', page = 1, limit = 10 } = params;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('applications')
        .select('*, candidates(*), jobs(*)', { count: 'exact' });

      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      let mapped = (data || []).map(normalizeApplication);

      if (search && search.trim() !== '') {
        const s = search.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.candidate?.name?.toLowerCase().includes(s) ||
            a.candidate?.email?.toLowerCase().includes(s) ||
            a.applicationId?.toLowerCase().includes(s) ||
            a.job?.title?.toLowerCase().includes(s)
        );
      }

      return {
        applications: mapped,
        total: count || mapped.length,
        page: Number(page),
        totalPages: Math.ceil((count || mapped.length) / limit) || 1
      };
    }

    // Fallback: Local Storage
    let list = getLocalApplications().map(normalizeApplication);
    if (status && status !== 'ALL') {
      list = list.filter((a) => a.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidate?.name?.toLowerCase().includes(s) ||
          a.candidate?.email?.toLowerCase().includes(s) ||
          a.applicationId?.toLowerCase().includes(s) ||
          a.job?.title?.toLowerCase().includes(s)
      );
    }

    const total = list.length;
    const from = (page - 1) * limit;
    const paginated = list.slice(from, from + limit);

    return {
      applications: paginated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  // 3. Fetch applications for a specific Job ID
  getApplicationsForJob: async (jobId, params = {}) => {
    const { search = '', status = 'ALL', page = 1, limit = 10 } = params;

    if (isSupabaseConfigured) {
      // First find job
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
      const { data: jobData } = isUuid
        ? await supabase.from('jobs').select('id, job_id, title').eq('id', jobId).maybeSingle()
        : await supabase.from('jobs').select('id, job_id, title').eq('job_id', jobId).maybeSingle();

      if (!jobData) {
        return { applications: [], total: 0, page: 1, totalPages: 1 };
      }

      let query = supabase
        .from('applications')
        .select('*, candidates(*), jobs(*)', { count: 'exact' })
        .eq('job_id', jobData.id);

      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      let mapped = (data || []).map(normalizeApplication);

      if (search && search.trim() !== '') {
        const s = search.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.candidate?.name?.toLowerCase().includes(s) ||
            a.candidate?.email?.toLowerCase().includes(s) ||
            a.applicationId?.toLowerCase().includes(s)
        );
      }

      return {
        job: { jobId: jobData.job_id, title: jobData.title },
        applications: mapped,
        total: count || mapped.length,
        page: Number(page),
        totalPages: Math.ceil((count || mapped.length) / limit) || 1
      };
    }

    // Fallback: Local Storage
    let list = getLocalApplications()
      .map(normalizeApplication)
      .filter((a) => a.job?.jobId === jobId || a.job?._id === jobId);

    if (status && status !== 'ALL') {
      list = list.filter((a) => a.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidate?.name?.toLowerCase().includes(s) ||
          a.candidate?.email?.toLowerCase().includes(s) ||
          a.applicationId?.toLowerCase().includes(s)
      );
    }

    const total = list.length;
    const from = (page - 1) * limit;

    return {
      job: { jobId },
      applications: list.slice(from, from + limit),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  // 4. Update application status (pipeline progression)
  updateApplicationStatus: async (id, status) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, candidates(*), jobs(*)')
        .single();

      if (error) throw new Error(error.message);
      return { data: normalizeApplication(data) };
    }

    const apps = getLocalApplications();
    const idx = apps.findIndex((a) => a.id === id || a.application_id === id);
    if (idx !== -1) {
      apps[idx].status = status;
      saveLocalApplications(apps);
      return { data: normalizeApplication(apps[idx]) };
    }
    throw new Error('Application not found');
  }
};
