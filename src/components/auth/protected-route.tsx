
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useBusinessInfo } from '@/contexts/business-info-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasRole } = useAuth();
  const { getResendApiKey } = useBusinessInfo();

  const hasValidApiKey = () => {
    const key = getResendApiKey();
    return key && !key.startsWith('re_xxxx');
  }
  
  const isAuthorized = hasRole(['Admin']) && hasValidApiKey();

  if (!isAuthorized) {
    return (
      <Alert variant="destructive">
        <KeyRound className="h-4 w-4" />
        <AlertTitle>API Key Required for Access</AlertTitle>
        <AlertDescription className="space-y-4">
            <p>
              Access to this module requires a valid API key to be configured. This is a protected area for Admin users.
            </p>
            <div>
              <p className="font-semibold">How to Resolve:</p>
              <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                  <li>Navigate to the <Link href="/dashboard/business-info" className="underline font-medium">Business Info</Link> page.</li>
                  <li>Click <strong>Generate New API Key</strong> and confirm the action when prompted. A valid key will be saved automatically.</li>
                  <li>Return to this page. You should now have access.</li>
                  <li>To see this message again for testing, you can manually edit the API key back to a placeholder like: `re_xxxxxxxx_xxxxxxxx`</li>
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
