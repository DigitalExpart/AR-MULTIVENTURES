import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth-layout';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@ar-multiventures/validation';
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
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout title="Reset Instructions Sent" subtitle="Password recovery email dispatched">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-50 text-success-700 border border-success-200 mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-h4 font-bold text-neutral-900 mb-2">Check Your Inbox</h3>
          <p className="text-body-sm text-neutral-600 mb-8 leading-relaxed max-w-sm mx-auto">
            We have sent password reset instructions to{' '}
            <strong className="text-neutral-900">{getValues('email')}</strong>. Please check your spam folder if you don't receive it in 2 minutes.
          </p>
          <Link to="/login">
            <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="h-4 w-4" />} className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Account Password"
      subtitle="Enter your corporate email address to receive password reset instructions."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Corporate Email Address"
          type="email"
          placeholder="operations@buildcorpng.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Send Reset Link
        </Button>
      </form>

      <p className="mt-8 text-center text-body-sm text-neutral-600">
        <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </Link>
      </p>
    </AuthLayout>
  );
}
