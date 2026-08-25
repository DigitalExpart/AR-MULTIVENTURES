import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth-layout';
import { loginSchema, type LoginFormValues } from '@ar-multiventures/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '../context/auth-context';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: 'operations@buildcorpng.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data);
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Client Portal Sign In"
      subtitle="Access your AR Multiventures account, active requisitions, and haulage tracking."
    >
      {error && (
        <Alert variant="error" className="mb-5" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Demo Credentials Tip for easy testing */}
      <div className="p-3 mb-5 rounded-lg bg-neutral-50 border border-neutral-200 text-caption text-neutral-600">
        <span className="font-bold text-neutral-900">Demo Testing Account:</span>
        <div className="flex justify-between mt-1 font-mono text-xs">
          <span>Email: operations@buildcorpng.com</span>
          <span>Pass: password123</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Corporate Email or Registered Phone"
          placeholder="operations@buildcorpng.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.emailOrPhone?.message}
          {...register('emailOrPhone')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Checkbox label="Remember this device" {...register('rememberMe')} />
          <Link
            to="/forgot-password"
            className="text-body-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In to Portal
        </Button>
      </form>

      <p className="mt-8 text-center text-body-sm text-neutral-600">
        New corporate contractor?{' '}
        <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline">
          Register Customer Account
        </Link>
      </p>
    </AuthLayout>
  );
}
