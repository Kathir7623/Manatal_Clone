'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useCandidateAuth } from '../../../context/CandidateAuthContext';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CandidateRegisterPage() {
  const { candidateRegister, isCandidateAuthenticated } = useCandidateAuth();
  const router = useRouter();
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isCandidateAuthenticated) {
      router.replace('/my-applications');
    }
  }, [isCandidateAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      currentLocation: '',
      experience: '0 - 1 Years'
    }
  });

  const onSubmit = async (data) => {
    setRegisterError('');
    setIsLoading(true);
    try {
      await candidateRegister(data);
      router.replace('/my-applications');
    } catch (err) {
      setRegisterError(err.message || 'Failed to register account.');
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
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-200">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Candidate Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register to easily apply for jobs, save details, and track your interview progress.
          </p>
        </div>

        {registerError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{registerError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Kathirvel Murugan"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Full name is required' })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address'
              }
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            required
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            required
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone number is required' })}
          />

          <Input
            label="Current Location"
            placeholder="e.g. Coimbatore, Hyderabad, or Chennai"
            {...register('currentLocation')}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Years of Experience
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              {...register('experience')}
            >
              <option value="0 - 1 Years">0 - 1 Years</option>
              <option value="1 - 3 Years">1 - 3 Years</option>
              <option value="3 - 5 Years">3 - 5 Years</option>
              <option value="5 - 7 Years">5 - 7 Years</option>
              <option value="7 - 11 Years">7 - 11 Years</option>
              <option value="11+ Years">11+ Years</option>
            </select>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
            Create Account & Continue
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
