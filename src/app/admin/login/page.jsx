'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Loader from '../../../components/Loader';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

function AdminLoginContent() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = searchParams.get('from') || '/admin/dashboard';

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(from);
    }
  }, [isAuthenticated, router, from]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoginError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.replace(from);
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Public Job Board
        </Link>

        <div className="w-12 h-12 bg-[#ed7a1c] text-white rounded-xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/25">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Admin / Recruiter Login
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Sign in to manage jobs, evaluate candidates, and review resumes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-slate-200">
          {loginError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="recruiter@vivantify.com"
              required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<Loader message="Preparing login screen..." />}>
      <AdminLoginContent />
    </Suspense>
  );
}
