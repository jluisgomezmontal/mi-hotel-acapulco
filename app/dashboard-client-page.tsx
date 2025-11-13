'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { BedDouble, Calendar, Users, CreditCard, ArrowRight, Sparkles } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRooms } from '@/lib/hooks/useRooms';
import { useReservations } from '@/lib/hooks/useReservations';
import { useGuests } from '@/lib/hooks/useGuests';
import { usePayments } from '@/lib/hooks/usePayments';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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
      
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
            alt="Hotel Acapulco"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wide">Mi Hotel Acapulco</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Gestión Hotelera Moderna
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Administra tu hotel con elegancia y eficiencia. Todo lo que necesitas en un solo lugar.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                <Link href="/reservations">
                  Nueva Reservación
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/reports">Ver Reportes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {hasError && (
          <Card className="mb-8 border-destructive/30 bg-destructive/10">
            <CardContent className="pt-6 text-sm text-destructive">
              Ocurrió un error al cargar las métricas. Verifica tu conexión e intenta de nuevo.
            </CardContent>
          </Card>
        )}

        {/* Metrics Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Métricas del Sistema</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          </div>
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
      <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {label}
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-1" />
          ) : (
            <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {value}
            </div>
          )}
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
