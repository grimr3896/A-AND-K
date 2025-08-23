
"use client";

import * as React from 'react';
import { useBusinessInfo } from '@/contexts/business-info-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function PasswordProtectedRoute({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) {
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const { getPassword } = useBusinessInfo();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    // Check sessionStorage to see if user has already unlocked this section
    const sessionUnlockKey = `unlocked_${pageTitle}`;
    if (sessionStorage.getItem(sessionUnlockKey) === 'true') {
      setIsUnlocked(true);
    }
  }, [pageTitle]);

  const handlePasswordSubmit = () => {
    if (passwordInput === getPassword()) {
      const sessionUnlockKey = `unlocked_${pageTitle}`;
      sessionStorage.setItem(sessionUnlockKey, 'true');
      setIsUnlocked(true);
      setPasswordInput('');
      toast({
        title: 'Access Granted',
        description: `You have successfully unlocked the ${pageTitle} section.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The password you entered is incorrect.',
      });
    }
  };
  
  const handleCancel = () => {
      router.push('/dashboard');
  }

  if (!isUnlocked) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Admin Access Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the admin password to view the "{pageTitle}" page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="••••••••"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return <>{children}</>;
}
