'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/context/AuthContext';

const AUTH_ROOT = '/auth';

const isAuthRoute = (pathname: string) => pathname.startsWith(AUTH_ROOT);

interface AppGuardProps {
  children: React.ReactNode;
}

export function AppGuard({ children }: AppGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const currentPath = pathname ?? '/';
    const authRoute = isAuthRoute(currentPath);

    if (!isAuthenticated && !authRoute) {
      const params = new URLSearchParams();
      params.set('returnUrl', `${currentPath}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`);
      router.replace(`/auth/login?${params.toString()}`);
      return;
    }

    if (isAuthenticated && authRoute) {
      const returnUrl = searchParams?.get('returnUrl');
      router.replace(returnUrl || '/');
    }
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  const currentPath = pathname ?? '/';
  const authRoute = isAuthRoute(currentPath);

  if (isLoading || (!authRoute && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
