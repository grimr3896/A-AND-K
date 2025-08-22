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
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  TrendingUp,
  Warehouse,
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasRole, logout } = useAuth();
  
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
    { href: '/dashboard/pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Staff'] },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes, roles: ['Admin', 'Manager', 'Staff'] },
    { href: '/dashboard/stock-requirements', label: 'Stock Requirements', icon: Warehouse, roles: ['Admin', 'Manager'] },
    { href: '/dashboard/transactions', label: 'Transactions', icon: ClipboardList, roles: ['Admin', 'Manager'] },
    { href: '/dashboard/layaways', label: 'Layaways', icon: Coins, roles: ['Admin', 'Manager'] },
    { href: '/dashboard/reports', label: 'Reports', icon: AreaChart, roles: ['Admin'] },
    { href: '/dashboard/profit-analysis', label: 'Profit Analysis', icon: TrendingUp, roles: ['Admin'] },
    { href: '/dashboard/ai-suggestions', label: 'AI Suggestions', icon: Cpu, roles: ['Admin'] },
    { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileClock, roles: ['Admin'] },
    { href: '/dashboard/business-info', label: 'Business Info', icon: Settings, roles: ['Admin'] },
  ];

  const accessibleLinks = navLinks.filter(link => hasRole(link.roles as any));

  if (!user) {
    // You can render a loading state here
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
              <Flower2 className="h-6 w-6" />
              <span className="font-headline">A & K babyshop</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto px-2 text-sm font-medium lg:px-4">
            {accessibleLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary font-semibold"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4">
              <div className="border-t pt-4">
                  <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary font-semibold w-full">
                      <LogOut className="h-4 w-4" />
                      Logout
                  </button>
              </div>
          </div>
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
                {accessibleLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-foreground hover:text-foreground font-semibold"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
                 <div className="mt-auto border-t pt-4">
                    <button onClick={logout} className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-foreground hover:text-foreground font-semibold w-full">
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
              </nav>
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
