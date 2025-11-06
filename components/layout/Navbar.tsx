'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BedDouble, Calendar, Users, CreditCard, BarChart3, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/rooms', label: 'Habitaciones', icon: BedDouble },
  { href: '/reservations', label: 'Reservaciones', icon: Calendar },
  { href: '/guests', label: 'Huéspedes', icon: Users },
  { href: '/payments', label: 'Pagos', icon: CreditCard },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const displayName = fullName || user?.email || 'Usuario';
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Mi Hotel Acapulco
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <ThemeToggle />

            {isLoading ? (
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {displayName}
                  </div>
                  <DropdownMenuItem onSelect={handleLogout} variant="destructive">
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0">
                <div className="p-4">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="text-sm font-medium text-muted-foreground">
                      Menú
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {isLoading ? 'Cargando...' : displayName}
                    </div>
                    {isLoading ? (
                      <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                    ) : (
                      <Button variant="destructive" size="sm" onClick={handleLogout}>
                        Cerrar sesión
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  );
}
