# Vivantify Technology Solutions - Modern ATS (Next.js 16 & Supabase)

A production-grade, Full-Stack **Applicant Tracking System (ATS) & Recruitment Portal** built for **Vivantify Technology Solutions**, powered by **Modern Next.js 16 (App Router)**, **React 19**, and **Supabase (PostgreSQL & Storage)**.

Designed for **single-link 1-click deployment on Vercel** without needing an external Express server or separate database hosts.

---

## 🚀 Key Features

### 🏢 Recruiter & Admin Suite (`/admin/dashboard`)
- **Direct Supabase Authentication**: Secure login at `/admin/login` using recruiter credentials stored in `admin_users` table with demo access.
- **Custom & Sequential Job IDs**: Create positions with custom Job IDs (e.g. `VIV-DEV-01`) or let PostgreSQL sequences auto-generate sequential `JOB-YYYY-XXXX` IDs.
- **Live Recruitment Analytics**: Real-time KPI counters tracking active pipelines, total applications, new applicants, and shortlisted candidates.
- **Candidate & Resume Review**: View full candidate profiles with all 14 data points, cover letters, and download uploaded resumes directly from Supabase Storage.
- **Recruitment Pipeline Statuses**: Progress candidates through stages: `NEW` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `SELECTED` / `REJECTED`.

### 👥 Public Careers Board (`/jobs`)
- **Curated Open Positions**: Real-time search and filter across department, location, experience, and employment type.
- **Detailed Job Specifications**: Full breakdown of roles, responsibilities, requirements, compensation, and required skills matrix.
- **14-Field Application Flow**: Applicant name, contact info, total experience, current CTC, expected CTC, notice period, portfolio/LinkedIn links, and drag-and-drop resume upload.
- **Supabase Storage Integration**: Resumes are stored in the private `resumes` bucket with public/signed access policies.
- **Automatic Application IDs**: Generates atomic sequential receipts (`APP-YYYY-XXXX`).
- **Duplicate Prevention**: Database constraints prevent duplicate applications for the same job from the same email.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend & API** | **Next.js 16.3+ (App Router)**, React 19, Turbopack |
| **Styling & Components** | Tailwind CSS v4, Lucide React, React Hook Form, TanStack React Query v5 |
| **Database & Storage** | **Supabase (PostgreSQL)** + **Supabase Storage** (resumes bucket) |
| **Hosting & Deployment** | **1-Click Vercel Deployment** (Single Project, Single URL) |

---

## 📐 Unified Architecture

```text
End-Users, Candidates, and Recruiters
                  │
                  ▼
┌───────────────────────────────────────────────────────────┐
│              ONE SINGLE APPLICATION (Vercel)              │
│               https://careers.vivantify.com               │
│                                                           │
│  - Public Careers Board (/jobs)                           │
│  - 14-Field Application Submission                        │
│  - Recruiter Admin Suite (/admin)                         │
│  - Supabase SDK Integration (@supabase/supabase-js)       │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                     Supabase Cloud                        │
│                                                           │
│  - PostgreSQL Database (jobs, candidates, applications)   │
│  - Supabase Storage (resumes bucket)                      │
│  - Row-Level Security & Triggers                          │
└───────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

> **Note**: The application includes a local fallback store out of the box, allowing full testing (creating jobs, applying, reviewing applicants) right away!

---

## 🗄️ Supabase Cloud Database Setup (1 Minute)

To connect the application to your live Supabase cloud instance:

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. Go to your **Supabase Dashboard ➔ SQL Editor**.
3. Open the **`supabase_schema.sql`** file located in the root of this repository, copy its contents, paste it into the SQL Editor, and click **RUN**.
4. Go to **Project Settings ➔ API** and copy:
   - **Project URL**
   - **anon / public key**
5. Paste them into `client/.env.local` (or `client/.env`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
6. That's it! Your live PostgreSQL database and Supabase Storage bucket are active.

---

## 🚢 1-Click Deployment to Vercel

1. Push your code to **GitHub**.
2. Log into [Vercel.com](https://vercel.com) and click **Add New... ➔ Project**.
3. Import your repository and set the **Root Directory** to `client`.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `your_supabase_url`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key`
5. Click **Deploy**!

You get a **single unified URL** (e.g. `https://vivantify-careers.vercel.app`) with zero external servers to maintain.

---

## 🔑 Default Credentials

| Portal | URL | Credentials |
|---|---|---|
| **Recruiter / Admin** | `http://localhost:3000/admin/login` | `admin@resume.com` / `Admin@12345` |
| **Public Jobs Board** | `http://localhost:3000/jobs` | *Public access* |
| **Candidate Portal** | `http://localhost:3000/login` | `candidate@test.com` / `Candidate@123` |

---

## 🏢 Vivantify Technology Solutions Info
- **Address**: 25, Subramaniam St, Olymbus, Bharathi Nagar, Ramanathapuram, Coimbatore, Tamil Nadu 641045
- **Phone**: +91 9366615960
- **Email**: info@vivantify.com
