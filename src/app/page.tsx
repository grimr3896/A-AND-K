import { Flower2 } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col items-center space-y-6">
        <div className="flex items-center space-x-2 text-primary">
          <Flower2 className="h-10 w-10" />
          <h1 className="text-4xl font-bold font-headline">A & K babyshop</h1>
        </div>
        <p className="text-center text-muted-foreground">
          Welcome back! Please enter your credentials to access your dashboard.
        </p>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Enter a username (e.g. A&Kbabyshop, manager, or staff) and the password. Default password is: ALEXA
        </p>
      </div>
    </main>
  );
}
