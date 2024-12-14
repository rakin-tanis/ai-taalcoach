'use client';

import { useState, useEffect } from 'react';
import { ResourceType } from '@/types';
import { checkPermission } from '@/lib/auth';
import { useSession } from 'next-auth/react';

export const useAuth = (
  action: string,
  resource: string,
  targetResource?: ResourceType | null
) => {
  const { data: session } = useSession();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const permission = checkPermission(
        session.user,
        action,
        resource,
        targetResource
      );
      setHasPermission(permission);
    }
  }, [session, action, resource, targetResource]);

  return [hasPermission];
};