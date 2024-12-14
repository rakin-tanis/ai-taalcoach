'use client';

import { signIn } from 'next-auth/react';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent></SignInContent>
    </Suspense>
  );
}

const SignInContent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!email || !email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password || !password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    console.log(newErrors)
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl,
      });

      if (result?.error) {
        // Handle error
        console.error(result.error);
        toast.error("Sign Up Failed", {
          description: result.error,
        });
      } else {
        toast.success("Sign In", {
          description: "success",
        });
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Error saving example:', error);
      // Optionally set a general error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', {
      callbackUrl: callbackUrl,
      redirect: true
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold dark:text-white">Sign in</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="form-group col-span-2">
            <input
              className="appearance-none rounded-md relative block w-full px-3 py-2 border dark:text-white"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="form-group col-span-2">
            <input
              type="password"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border dark:text-white"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <Button
              className="w-full justify-center py-2 px-4 border border-transparent text-sm font-medium"
              type='submit'
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </div>
        </form>
        <div className="text-center text-sm dark:text-gray-400">
          <p>
            Don&apos;t have an account?{' '}
            <a
              href="/auth/signUp"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-200 dark:hover:text-indigo-100"
            >
              Sign up
            </a>
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}