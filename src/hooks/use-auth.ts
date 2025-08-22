"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Redirect to login if no user is found in localStorage
        // router.push('/');
      }
    } catch (error) {
        // This can happen if running on the server, just ignore.
    }
  }, [router]);

  const hasRole = (roles: UserRole[]) => {
    return user && roles.includes(user.role);
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    router.push('/');
  };

  return { user, hasRole, logout };
}
