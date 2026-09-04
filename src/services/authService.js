import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  login: async (credentials) => {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Please provide email and password.');
    }

    if (isSupabaseConfigured) {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error || !adminUser) {
        throw new Error('Invalid email or password.');
      }

      // Verify password
      if (adminUser.password !== password) {
        throw new Error('Invalid email or password.');
      }

      const token = `supabase-admin-${adminUser.id}-${Date.now()}`;
      const user = {
        _id: adminUser.id,
        id: adminUser.id,
        name: adminUser.name || 'Vivantify Recruiter',
        email: adminUser.email,
        role: adminUser.role || 'admin'
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return {
        token,
        user
      };
    }

    // Fallback Local Demo Mode Credentials
    if (email.trim().toLowerCase() === 'admin@resume.com' && password === 'Admin@12345') {
      const token = `mock-admin-token-${Date.now()}`;
      const user = {
        _id: 'admin-001',
        id: 'admin-001',
        name: 'Vivantify Talent Acquisition',
        email: 'admin@resume.com',
        role: 'admin'
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return {
        token,
        user
      };
    }

    throw new Error('Invalid email or password. Use demo: admin@resume.com / Admin@12345');
  },

  getMe: async () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          return { user: JSON.parse(savedUser) };
        } catch {
          // ignore
        }
      }
    }
    return {
      user: {
        name: 'Vivantify Talent Acquisition',
        email: 'admin@resume.com',
        role: 'admin'
      }
    };
  }
};
