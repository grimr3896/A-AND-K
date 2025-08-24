
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (window.location.pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      if (window.location.pathname !== '/') {
        router.push('/');
      }
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  const hasRole = (roles: UserRole[]) => {
    if (isLoading || !user) return false;
    return roles.includes(user.role);
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    router.push('/');
  };

  return { user, hasRole, logout, isLoading };
}
