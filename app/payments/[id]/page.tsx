'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, CalendarDays, Mail, Phone, Home, User } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/lib/hooks/usePayments';
import { useMemo } from 'react';
import type { Guest, Payment, Reservation } from '@/lib/types';

const methodLabels: Record<Payment['method'], string> = {
  efectivo: 'Efectivo',
  tdd: 'Tarjeta de Débito',
  tdc: 'Tarjeta de Crédito',
};

const methodColors: Record<Payment['method'], string> = {
  efectivo: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  tdd: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  tdc: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200',
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const paymentId = params?.id ?? '';
  const router = useRouter();
  const { data: payment, isLoading, error } = usePayment(paymentId);
  const reservation = payment?.reservation as Reservation | undefined;
  const guest = payment?.guest as Guest | undefined;

  const reservationSummary = useMemo(() => {
    if (!reservation) return null;
    return {
      room: reservation.roomNumber ?? (typeof reservation.room === 'object' ? reservation.room.number : '—'),
      status: reservation.status,
      total: reservation.totalPrice,
      totalPaid: reservation.totalPaid ?? 0,
      balanceDue: reservation.balanceDue ?? 0,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guestName: reservation.guestName,
    };
  }, [reservation]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Detalle del pago</h1>
              <p className="text-sm text-muted-foreground">ID: {paymentId}</p>
            </div>
          </div>
          <Link href="/payments">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ver todos los pagos
            </Button>
          </Link>
        </div>

        {!paymentId && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                No se proporcionó un identificador de pago válido.
              </p>
            </CardContent>
          </Card>
        )}

        {paymentId && isLoading && (
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-4 w-56 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        )}

        {paymentId && error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Ocurrió un error al cargar el pago. Verifica la conexión e inténtalo de nuevo.
              </p>
            </CardContent>
          </Card>
        )}

        {paymentId && !isLoading && !error && !payment && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No se encontró el pago solicitado. Puede que haya sido eliminado o que el identificador sea incorrecto.
              </p>
            </CardContent>
          </Card>
        )}

        {payment && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Información del pago</CardTitle>
                  <CardDescription>Detalles principales del pago registrado.</CardDescription>
                </div>
                <Badge className={methodColors[payment.method]}>{methodLabels[payment.method]}</Badge>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-lg font-semibold text-foreground">{currencyFormatter.format(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de la reservacion</p>
                  <p className="text-lg font-medium text-foreground">
                    {reservation?.createdAt ? formatDateTime(reservation.createdAt) : 'No disponible'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pago registrado</p>
                  <p className="text-lg font-medium text-foreground">
                    {payment.createdAt ? formatDateTime(payment.createdAt) : 'No disponible'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="text-lg font-medium text-foreground">
                    {payment.updatedAt ? formatDateTime(payment.updatedAt) : 'No disponible'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="rounded-md border border-muted px-3 py-2 text-sm text-foreground">
                    {payment.notes?.trim() || 'Sin notas registradas.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {guest && (
                <Card>
                  <CardHeader>
                    <CardTitle>Huésped</CardTitle>
                    <CardDescription>Información del huésped asociado al pago.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{guest.firstName} {guest.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{guest.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{guest.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reservation && reservationSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reservación vinculada</CardTitle>
                    <CardDescription>Resumen de la reservación donde se aplicó el pago.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Habitación {reservationSummary.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Estado: {reservationSummary.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {new Date(reservationSummary.checkIn).toLocaleDateString('es-MX')} -{' '}
                        {new Date(reservationSummary.checkOut).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div className="grid gap-1">
                      <span>Total: {currencyFormatter.format(reservationSummary.total)}</span>
                      <span>Pagado: {currencyFormatter.format(reservationSummary.totalPaid)}</span>
                      <span>Saldo pendiente: {currencyFormatter.format(reservationSummary.balanceDue)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Huésped de contacto</p>
                      <p className="text-foreground font-medium">{reservationSummary.guestName ?? '—'}</p>
                    </div>
                    <Link href={`/reservations/${reservation._id ?? payment.reservation}`}>
                      <Button variant="ghost" size="sm" className="mt-2 flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Ver reservación
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {!guest && (
                <Card>
                  <CardHeader>
                    <CardTitle>Huésped</CardTitle>
                    <CardDescription>Este pago no tiene información de huésped asociada.</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
