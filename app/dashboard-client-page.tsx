'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { BedDouble, Calendar, Users, CreditCard } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRooms } from '@/lib/hooks/useRooms';
import { useReservations } from '@/lib/hooks/useReservations';
import { useGuests } from '@/lib/hooks/useGuests';
import { usePayments } from '@/lib/hooks/usePayments';
import { Skeleton } from '@/components/ui/skeleton';

const ACTIVE_RESERVATION_STATUS = new Set([
  'pending',
  'confirmed',
  'checked-in',
]);

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

export function DashboardClientPage() {
  const roomsQuery = useRooms();
  const reservationsQuery = useReservations();
  const guestsQuery = useGuests({ page: 1, limit: 1 });

  const now = new Date();
  const monthStart = useMemo(() => {
    const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    return start.toISOString();
  }, [now]);

  const monthEnd = useMemo(() => {
    const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
    return end.toISOString();
  }, [now]);

  const paymentsQuery = usePayments({ startDate: monthStart, endDate: monthEnd });

  const roomsTotal = roomsQuery.data?.length ?? 0;
  const reservationsTotal = reservationsQuery.data?.filter((reservation) =>
    reservation.status && ACTIVE_RESERVATION_STATUS.has(reservation.status),
  ).length ?? 0;
  const guestsTotal = guestsQuery.data?.total ?? 0;
  const monthlyPaymentsTotal = paymentsQuery.data?.totalAmount ?? 0;

  const isLoading =
    roomsQuery.isLoading ||
    reservationsQuery.isLoading ||
    guestsQuery.isLoading ||
    paymentsQuery.isLoading;

  const hasError = roomsQuery.error || reservationsQuery.error || guestsQuery.error || paymentsQuery.error;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Bienvenido al sistema de gestión hotelera de Mi Hotel Admin
          </p>
        </div>

        {hasError && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10">
            <CardContent className="pt-6 text-sm text-destructive">
              Ocurrió un error al cargar las métricas. Verifica tu conexión e intenta de nuevo.
            </CardContent>
          </Card>
        )}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            href="/rooms"
            icon={BedDouble}
            label="Habitaciones"
            description="Total de habitaciones"
            value={roomsTotal.toString()}
            isLoading={isLoading}
          />

          <MetricCard
            href="/reservations"
            icon={Calendar}
            label="Reservaciones"
            description="Reservaciones activas"
            value={reservationsTotal.toString()}
            isLoading={isLoading}
          />

          <MetricCard
            href="/guests"
            icon={Users}
            label="Huéspedes"
            description="Total de huéspedes"
            value={guestsTotal.toString()}
            isLoading={isLoading}
          />

          <MetricCard
            href="/payments"
            icon={CreditCard}
            label="Pagos"
            description="Pagos del mes"
            value={currencyFormatter.format(monthlyPaymentsTotal)}
            isLoading={isLoading}
          />
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <QuickActionCard
            href="/rooms"
            icon={BedDouble}
            title="Gestionar Habitaciones"
            description="Agregar, editar y ver habitaciones"
          />
          <QuickActionCard
            href="/reservations"
            icon={Calendar}
            title="Nueva Reservación"
            description="Crear y gestionar reservaciones"
          />
          <QuickActionCard
            href="/guests"
            icon={Users}
            title="Registrar Huésped"
            description="Gestionar información de huéspedes"
          />
        </section>
      </main>
    </div>
  );
}

interface MetricCardProps {
  href: string;
  label: string;
  description: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
}

function MetricCard({ href, label, description, value, icon: Icon, isLoading }: MetricCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">{label}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold text-foreground">{value}</div>
          )}
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function QuickActionCard({ href, title, description, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <Icon className="h-10 w-10 text-primary" />
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
