
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, hasValidApiKey } = useAuth();
  
  const isAuthorized = hasRole(['Admin']) && hasValidApiKey();

  if (!isAuthorized) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription className="space-y-4">
            <p>
            You do not have the required permissions to view this page. Access to this module requires both 
            <strong> Admin</strong> privileges and a valid <strong>API Key</strong>.
            </p>
            <p>
            Please ensure you are logged in as an Admin and have a valid API key configured in the 
            Business Info settings.
            </p>
             <Button asChild variant="secondary">
                <Link href="/dashboard/business-info">
                    Go to Business Info
                </Link>
            </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
