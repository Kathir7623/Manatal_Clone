'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useCandidateAuth } from '../../../context/CandidateAuthContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Loader from '../../../components/Loader';
import { UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';

function CandidateLoginContent() {
  const { candidateLogin, isCandidateAuthenticated } = useCandidateAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = searchParams.get('from') || '/my-applications';

  React.useEffect(() => {
    if (isCandidateAuthenticated) {
      router.replace(from);
    }
  }, [isCandidateAuthenticated, router, from]);

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
      await candidateLogin(data.email, data.password);
      router.replace(from);
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Jobs
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 border border-orange-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Sign In</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your job applications, view status updates, and manage your profile.
          </p>
        </div>

        {loginError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
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

          <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
            Sign In to Candidate Account
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-center text-xs text-slate-500">
            Don't have a candidate account yet?{' '}
            <Link href="/register" className="font-semibold text-[#ed7a1c] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={<Loader message="Preparing login screen..." />}>
      <CandidateLoginContent />
    </Suspense>
  );
}
