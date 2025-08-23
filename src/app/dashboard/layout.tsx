

"use client";

import * as React from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Boxes,
  ClipboardList,
  Coins,
  Cpu,
  FileClock,
  Flower2,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  TrendingUp,
  Warehouse,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { ProductsProvider } from '@/contexts/products-context';
import { BusinessInfoProvider } from '@/contexts/business-info-context';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';

const protectedRoutesWithApiKey = [
  '/dashboard/ai-suggestions',
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasRole, logout, isLoading } = useAuth();
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
    { href: '/dashboard/pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Staff'] },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes, roles: ['Admin', 'Manager', 'Staff'] },
    { href: '/dashboard/layaways', label: 'Layaways', icon: Coins, roles: ['Admin', 'Manager', 'Staff'] },
    // Protected routes below
    { href: '/dashboard/stock-requirements', label: 'Stock Requirements', icon: Warehouse, roles: ['Admin', 'Manager'] },
    { href: '/dashboard/sales-history', label: 'Sales History', icon: History, roles: ['Admin', 'Manager'], isLocked: true },
    { href: '/dashboard/reports', label: 'Reports', icon: AreaChart, roles: ['Admin'], isLocked: true },
    { href: '/dashboard/profit-analysis', label: 'Profit Analysis', icon: TrendingUp, roles: ['Admin'], isLocked: true },
    { href: '/dashboard/ai-suggestions', label: 'AI Suggestions', icon: Cpu, roles: ['Admin'] },
    { href: '/dashboard/email', label: 'Email Reports', icon: Mail, roles: ['Admin'], isLocked: true },
    { href: '/dashboard/business-info', label: 'Business Info', icon: Settings, roles: ['Admin'], isLocked: true },
  ];

  const accessibleLinks = navLinks.filter(link => hasRole(link.roles as any));

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-transparent">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!user) {
    // This part should ideally not be reached if the useAuth hook redirects properly.
    // It's a fallback.
    return null;
  }
  
  const isProtectedRoute = protectedRoutesWithApiKey.includes(pathname);

  return (
    <BusinessInfoProvider>
      <ProductsProvider>
        <div className="grid min-h-screen w-full bg-card/80 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                  <Flower2 className="h-6 w-6" />
                  <span className="font-headline">A & K babyshop</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-auto px-2 text-base lg:px-4 space-y-1">
                {accessibleLinks.map(({ href, label, icon: Icon, isLocked }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between gap-4 rounded-lg px-4 py-4 text-foreground transition-all hover:text-primary font-semibold text-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-6 w-6" />
                      {label}
                    </div>
                    {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Flower2 className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <nav className="grid gap-2 text-lg font-medium">
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-lg font-semibold text-primary mb-4"
                    >
                      <Flower2 className="h-6 w-6" />
                      <span className="sr-only">A & K babyshop</span>
                    </Link>
                    {accessibleLinks.map(({ href, label, icon: Icon, isLocked }) => (
                      <Link
                        key={label}
                        href={href}
                        className="mx-[-0.65rem] flex items-center justify-between gap-4 rounded-xl px-4 py-4 text-foreground hover:text-foreground font-semibold text-lg"
                      >
                         <div className="flex items-center gap-4">
                            <Icon className="h-6 w-6" />
                            {label}
                        </div>
                        {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                      </Link>
                    ))}
                  </nav>
                   <div className="mt-auto border-t pt-4">
                      <button onClick={logout} className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-3 text-foreground hover:text-foreground font-semibold w-full">
                          <LogOut className="h-5 w-5" />
                          Logout
                      </button>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="w-full flex-1">
                {/* Can add a search bar here later */}
              </div>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/40x40" alt={user.username} data-ai-hint="profile person" />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.username} ({user.role})
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/business-info">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-transparent">
              {isProtectedRoute ? (
                <ProtectedRoute>
                  {children}
                </ProtectedRoute>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </ProductsProvider>
    </BusinessInfoProvider>
  );
}
