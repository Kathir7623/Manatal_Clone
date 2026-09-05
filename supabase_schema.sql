-- ==============================================================================
-- Vivantify Technology Solutions - Applicant Tracking System
-- Supabase PostgreSQL Database Schema & Initial Data Seeder
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Create a free project at https://supabase.com
-- 2. Open your Supabase Dashboard -> SQL Editor
-- 3. Click "New Query", paste this entire script, and click "RUN"
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Sequences for Sequential ID Generation
CREATE SEQUENCE IF NOT EXISTS job_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS app_sequence START 1;

-- 3. Table: Admin Users (Recruiter Authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Stored hashed or verified
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Admin Recruiter (admin@resume.com / Admin@12345)
INSERT INTO admin_users (email, password, name, role)
VALUES (
  'admin@resume.com',
  'Admin@12345',
  'Vivantify Talent Acquisition',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- 4. Table: Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'Full Time',
  experience TEXT NOT NULL,
  openings INT NOT NULL DEFAULT 1,
  salary TEXT DEFAULT 'Competitive',
  about_role TEXT DEFAULT '',
  candidate_profile TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  mandatory_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_jobs_job_id ON jobs(job_id);

-- 5. Trigger: Auto-generate sequential Job ID if not supplied
CREATE OR REPLACE FUNCTION set_job_id_if_empty()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_id IS NULL OR TRIM(NEW.job_id) = '' THEN
    NEW.job_id := 'JOB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('job_sequence')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_job_id ON jobs;
CREATE TRIGGER trigger_set_job_id
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION set_job_id_if_empty();

-- 6. Table: Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  pan_card TEXT,
  date_of_birth TEXT,
  total_experience TEXT,
  current_location TEXT,
  current_company TEXT,
  current_ctc TEXT,
  expected_ctc TEXT,
  notice_period TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- 7. Table: Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT UNIQUE NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  resume_filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (
    status IN ('NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED')
  ),
  cover_letter TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id) -- Prevent duplicate applications for the same job
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 8. Trigger: Auto-generate sequential Application ID if not supplied
CREATE OR REPLACE FUNCTION set_app_id_if_empty()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_id IS NULL OR TRIM(NEW.application_id) = '' THEN
    NEW.application_id := 'APP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('app_sequence')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_app_id ON applications;
CREATE TRIGGER trigger_set_app_id
BEFORE INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION set_app_id_if_empty();

-- 9. Supabase Storage: 'resumes' Bucket Setup
-- Note: In Supabase, files can be stored in the 'resumes' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Enable public uploads for applicants & reads for recruiters)
CREATE POLICY "Allow Public Resume Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow Public Resume Downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- 9.1 Disable Row Level Security on Application Tables
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 10. Seed Initial Opportunities for Vivantify
INSERT INTO jobs (
  job_id, title, description, location, employment_type, experience, openings, salary,
  about_role, skills, mandatory_skills, preferred_skills, responsibilities, requirements, benefits, status
)
VALUES
(
  'JOB-2026-0001',
  'Contractor - ServiceNow Sr Developer',
  'Lead the technical design, development, and implementation of ServiceNow modules and custom integrations for our enterprise clients.',
  'Coimbatore / Remote',
  'Contract',
  '7 - 11 Years',
  2,
  '₹22-28 LPA',
  'We are seeking a senior ServiceNow developer with hands-on expertise in custom scoped applications and ITSM.',
  ARRAY['ServiceNow', 'ITSM', 'JavaScript', 'REST APIs', 'Service Portal'],
  ARRAY['ServiceNow-CustomApp Development', 'ITSM Suite'],
  ARRAY['Certified Implementation Specialist', 'Data Modeling'],
  ARRAY[
    'Architect and implement scalable ServiceNow solutions.',
    'Build and maintain complex REST/SOAP integrations.',
    'Lead technical code reviews and platform upgrades.'
  ],
  ARRAY[
    '7+ years in enterprise IT application development.',
    'Proven track record implementing ServiceNow ITSM/ITOM modules.',
    'Strong analytical and cross-functional communication skills.'
  ],
  ARRAY['Flexible Working Hours', 'Remote Setup Allowance', 'Certification Sponsorship'],
  'OPEN'
),
(
  'JOB-2026-0002',
  'Senior Full Stack Engineer (Next.js & Node.js)',
  'Build and optimize performant, modern web applications powering digital talent and enterprise ATS operations.',
  'Coimbatore',
  'Full Time',
  '3 - 6 Years',
  3,
  '₹14-18 LPA',
  'Join our core engineering team in Coimbatore crafting resilient digital recruitment tools.',
  ARRAY['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  ARRAY['Next.js App Router', 'PostgreSQL / SQL'],
  ARRAY['Supabase experience', 'TypeScript'],
  ARRAY[
    'Design and deliver high-performance user interfaces in Next.js.',
    'Maintain SQL data layer and secure API endpoints.',
    'Collaborate closely with product designers and clients.'
  ],
  ARRAY[
    'Strong foundation in JavaScript/TypeScript and SQL databases.',
    'Deep understanding of server-side rendering (SSR) and client state management.'
  ],
  ARRAY['Health Insurance', 'Performance Bonus', 'Learning Stipend'],
  'OPEN'
)
ON CONFLICT (job_id) DO NOTHING;
