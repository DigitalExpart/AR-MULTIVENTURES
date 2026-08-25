import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/auth-layout';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a password reset link">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-50 text-success-600 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-body text-neutral-600 mb-6">
            We've sent a password reset link to{' '}
            <span className="font-semibold text-neutral-900">{getValues('email')}</span>.
            Check your email and follow the instructions.
          </p>
          <Link to="/login">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-neutral-500">
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
