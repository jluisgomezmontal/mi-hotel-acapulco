'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BedDouble, Calendar, Users, CreditCard, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

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

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Mi Hotel Acapulco
          </Link>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
