'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { candidateAuthService } from '../services/candidateAuthService';

const CandidateAuthContext = createContext(null);

export const CandidateAuthProvider = ({ children }) => {
  const [candidateUser, setCandidateUser] = useState(null);
  const [candidateToken, setCandidateToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('candidateUser');
      const savedToken = localStorage.getItem('candidateToken');
      if (saved) {
        try {
          setCandidateUser(JSON.parse(saved));
        } catch {}
      }
      if (savedToken) {
        setCandidateToken(savedToken);
      }
    }
  }, []);

  useEffect(() => {
    const checkCandidateSession = async () => {
      if (candidateToken) {
        try {
          const profile = await candidateAuthService.getMe();
          setCandidateUser(profile);
          localStorage.setItem('candidateUser', JSON.stringify(profile));
        } catch (err) {
          console.warn('Candidate session check failed:', err.message);
          candidateLogout();
        }
      }
      setLoading(false);
    };

    checkCandidateSession();
  }, [candidateToken]);

  const candidateLogin = async (email, password) => {
    const data = await candidateAuthService.login({ email, password });
    const { token, candidate } = data;

    localStorage.setItem('candidateToken', token);
    localStorage.setItem('candidateUser', JSON.stringify(candidate));

    setCandidateToken(token);
    setCandidateUser(candidate);
    return candidate;
  };

  const candidateRegister = async (formData) => {
    const data = await candidateAuthService.register(formData);
    const { token, candidate } = data;

    localStorage.setItem('candidateToken', token);
    localStorage.setItem('candidateUser', JSON.stringify(candidate));

    setCandidateToken(token);
    setCandidateUser(candidate);
    return candidate;
  };

  const candidateLogout = () => {
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('candidateUser');
    setCandidateToken(null);
    setCandidateUser(null);
  };

  const value = {
    candidateUser,
    candidateToken,
    isCandidateAuthenticated: !!candidateToken && !!candidateUser,
    loading,
    candidateLogin,
    candidateRegister,
    candidateLogout
  };

  return (
    <CandidateAuthContext.Provider value={value}>
      {children}
    </CandidateAuthContext.Provider>
  );
};

export const useCandidateAuth = () => {
  const context = useContext(CandidateAuthContext);
  if (!context) {
    throw new Error('useCandidateAuth must be used within a CandidateAuthProvider');
  }
  return context;
};
