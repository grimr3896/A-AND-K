
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, hasValidApiKey } = useAuth();
  
  const isAuthorized = hasRole(['Admin']) && hasValidApiKey();

  if (!isAuthorized) {
    return (
      <Alert variant="destructive">
        <KeyRound className="h-4 w-4" />
        <AlertTitle>API Key Required for Access</AlertTitle>
        <AlertDescription className="space-y-4">
            <p>
              Access to this module requires a valid API key to be configured. This is a protected area.
            </p>
            <div>
              <p className="font-semibold">How to Test:</p>
              <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                  <li>Go to the <Link href="/dashboard/business-info" className="underline font-medium">Business Info</Link> page.</li>
                  <li>Click <strong>Generate New API Key</strong> and confirm. A valid key will be saved.</li>
                  <li>Return to this page. You should now see the content.</li>
                  <li>To see this message again, edit the API key and set it to the default placeholder: `ak_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`</li>
              </ol>
            </div>
             <Button asChild variant="secondary">
                <Link href="/dashboard/business-info">
                    Go to Business Info Settings
                </Link>
            </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
