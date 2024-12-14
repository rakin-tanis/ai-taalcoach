import React from 'react'
import { Button } from './ui/Button';
import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';

const SignInButton = ({ isLoading, showIcon }: { isLoading: boolean, showIcon?: boolean }) => {
  return (
    <Button
      variant="ghost"
      onClick={() => signIn()}
      disabled={isLoading}
      className="flex items-center gap-2 dark:text-gray-200 dark:hover:text-gray-800"
    >

      {showIcon && <LogIn className="w-6 h-6" />}
      Sign In
    </Button>
  );
}

export default SignInButton
