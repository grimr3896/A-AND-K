
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasRole } = useAuth();

  // In a real app, you might have a server-side check or an API endpoint
  // to confirm the key's validity. For this setup, we just check its presence.
  // The value is injected at build time by Next.js.
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  const isAuthorized = hasRole(['Admin']);

  if (!isAuthorized) {
    // This case should ideally be handled by page-level checks or layout logic,
    // but it's a good fallback.
     return (
      <Alert variant="destructive">
        <KeyRound className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
            You do not have the required permissions to view this page. Please contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasApiKey) {
     return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Gemini API Key is Missing</AlertTitle>
        <AlertDescription className="space-y-4">
            <p>
              The AI-powered features on this page require a Google Gemini API key. Please set it up to continue.
            </p>
            <div>
              <p className="font-semibold">How to Resolve:</p>
              <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                  <li>Find or create the `.env` file in the root of your project directory.</li>
                  <li>Add the following line to the file, replacing `YOUR_API_KEY` with your actual Gemini API key:</li>
                  <li className="list-none my-2">
                    <code className="bg-muted text-muted-foreground p-2 rounded-md text-xs">
                      NEXT_PUBLIC_GEMINI_API_KEY=YOUR_API_KEY
                    </code>
                  </li>
                  <li>Restart your development server for the changes to take effect.</li>
              </ol>
            </div>
             <Button asChild variant="secondary">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Get a Gemini API Key
                </a>
            </Button>
        </AlertDescription>
      </Alert>
    );
  }


  return <>{children}</>;
}
