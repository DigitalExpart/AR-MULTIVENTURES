import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Lock, Building, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth-layout';
import { registerSchema, type RegisterFormValues } from '@ar-multiventures/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '../context/auth-context';

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      await registerUser(data);
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Contractor Account"
      subtitle="Register your construction company or site procurement account."
    >
      {error && (
        <Alert variant="error" className="mb-5" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Adebayo"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Ogundimu"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Company / Project Site Name"
          placeholder="e.g. BuildCorp Nigeria Ltd"
          leftIcon={<Building className="h-4 w-4" />}
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Input
          label="Corporate Email Address"
          type="email"
          placeholder="operations@company.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone Number (WhatsApp Active)"
          type="tel"
          placeholder="+234 812 345 6789"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password (min. 8 characters)"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="pt-1">
          <Checkbox
            label="I accept AR Multiventures Terms of Supply & Haulage Policy"
            error={errors.acceptTerms?.message}
            {...register('acceptTerms')}
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-3"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Complete Registration
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-neutral-600">
        Already registered?{' '}
        <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
