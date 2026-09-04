import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizeApplication } from './applicationService';

export const candidateAuthService = {
  register: async (userData) => {
    const { name, email, password, phone } = userData;

    if (isSupabaseConfigured) {
      const { data: existing } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        throw new Error('An account with this email address already exists.');
      }

      const { data: candidate, error } = await supabase
        .from('candidates')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || ''
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      const token = `cand-${candidate.id}-${Date.now()}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('candidateToken', token);
        localStorage.setItem('candidateUser', JSON.stringify(candidate));
      }

      return {
        token,
        candidate
      };
    }

    // Fallback: Local
    const token = `mock-cand-token-${Date.now()}`;
    const candidate = {
      _id: 'cand-001',
      id: 'cand-001',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || ''
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('candidateToken', token);
      localStorage.setItem('candidateUser', JSON.stringify(candidate));
    }
    return { token, candidate };
  },

  login: async (credentials) => {
    const { email, password } = credentials;

    if (isSupabaseConfigured) {
      const { data: candidate, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error || !candidate) {
        throw new Error('No candidate profile found with this email.');
      }

      const token = `cand-${candidate.id}-${Date.now()}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('candidateToken', token);
        localStorage.setItem('candidateUser', JSON.stringify(candidate));
      }

      return {
        token,
        candidate
      };
    }

    // Fallback demo candidate
    const token = `mock-cand-token-${Date.now()}`;
    const candidate = {
      _id: 'cand-001',
      id: 'cand-001',
      name: 'Kathirvel Candidate',
      email: email || 'candidate@test.com',
      phone: '+91 9876543210'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('candidateToken', token);
      localStorage.setItem('candidateUser', JSON.stringify(candidate));
    }
    return { token, candidate };
  },

  getMe: async () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('candidateUser');
      if (stored) {
        try {
          return { candidate: JSON.parse(stored) };
        } catch {
          // ignore
        }
      }
    }
    return {
      candidate: {
        name: 'Kathirvel Candidate',
        email: 'candidate@test.com'
      }
    };
  },

  getMyApplications: async () => {
    if (isSupabaseConfigured) {
      let candidateEmail = null;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('candidateUser');
        if (stored) {
          try {
            candidateEmail = JSON.parse(stored)?.email;
          } catch {
            // ignore
          }
        }
      }

      if (!candidateEmail) return [];

      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', candidateEmail)
        .maybeSingle();

      if (!candidate) return [];

      const { data: apps, error } = await supabase
        .from('applications')
        .select('*, jobs(*)')
        .eq('candidate_id', candidate.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (apps || []).map(normalizeApplication);
    }

    // Fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vivantify_applications');
      if (stored) {
        try {
          return JSON.parse(stored).map(normalizeApplication);
        } catch {
          return [];
        }
      }
    }
    return [];
  }
};

export default candidateAuthService;
