
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { getApiKey as getDefaultApiKey } from '@/lib/mock-data';

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // This effect should only run on the client-side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push('/');
      }
      setIsLoading(false);
    }
  }, [router]);

  const hasRole = (roles: UserRole[]) => {
    if (isLoading || !user) return false;
    return roles.includes(user.role);
  };
  
  const hasValidApiKey = () => {
    if (typeof window !== 'undefined') {
        const storedApiKey = localStorage.getItem('apiKey');
        // TEST: Temporarily consider the default key as invalid for testing purposes
        if (!storedApiKey || storedApiKey.startsWith('ak_xxxx')) {
            return false;
        }
        return true;
    }
    return false;
  }

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    router.push('/');
  };

  return { user, hasRole, logout, isLoading, hasValidApiKey };
}
