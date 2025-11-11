'use client';

import { useEffect, useMemo, useState } from 'react';

import { Navbar } from '@/components/layout/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReservations } from '@/lib/hooks/useReservations';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import type { Reservation, Room, Guest } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusLabels: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  'checked-in': 'Check-in',
  'checked-out': 'Check-out',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const statusColors: Record<Reservation['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  'checked-in': 'bg-green-200 text-green-900 dark:bg-green-600/30 dark:text-green-100',
  'checked-out': 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-foreground',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
};


const statusOptions: Array<'all' | Reservation['status']> = [
  'all',
  'pending',
  'confirmed',
  'checked-in',
  'checked-out',
  'cancelled',
  'completed',
];

const STATUS_FILTER_STORAGE_KEY = 'reservations:status-filter';

export default function ReservationsPage() {
  const { data: reservations, isLoading, error } = useReservations();
  const [statusFilter, setStatusFilter] = useState<'all' | Reservation['status']>('all');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedFilter = window.localStorage.getItem(STATUS_FILTER_STORAGE_KEY);
    if (storedFilter && statusOptions.includes(storedFilter as typeof statusOptions[number])) {
      setStatusFilter(storedFilter as typeof statusOptions[number]);
    }
  }, []);

  const handleStatusChange = (value: string) => {
    const typedValue = (value as 'all' | Reservation['status']) ?? 'all';
    setStatusFilter(typedValue);

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STATUS_FILTER_STORAGE_KEY, typedValue);
  };

  const sortedReservations = useMemo(() => {
    if (!reservations) {
      return [];
    }

    return [...reservations].sort(
      (a, b) => new Date(a.checkIn).getTime() + new Date(b.checkIn).getTime(),
    );
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === 'all') {
      return sortedReservations;
    }

    return sortedReservations.filter((reservation) => reservation.status === statusFilter);
  }, [sortedReservations, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Reservaciones</h1>
            <p className="mt-2 text-muted-foreground">Gestiona las reservaciones del hotel</p>
          </div>
          <Link href="/reservations/new">
            <Button size="sm" className="md:h-9 md:px-4 md:gap-2 md:has-[>svg]:px-3">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Reservación
            </Button>
          </Link>
        </div>
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Cargando reservaciones...</div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error al cargar reservaciones. Verifica que la API esté corriendo.
              </p>
            </CardContent>
          </Card>
        )}

        {reservations && reservations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Reservaciones</CardTitle>
              <CardDescription>
                {filteredReservations.length} reservación
                {filteredReservations.length !== 1 ? 'es' : ''} registrada
                {filteredReservations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Filtra por estado para enfocarte en las reservaciones relevantes.
                </div>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === 'all' ? 'Todas las reservaciones' : statusLabels[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Habitación</TableHead>
                    <TableHead>Huésped</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Huéspedes</TableHead>
                    <TableHead>Precio Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation: Reservation) => {
                    const room = reservation.room as Room | string | number | undefined;
                    const guest = reservation.guest as Guest | string | undefined;
                    const roomDisplay =
                      typeof room === 'object'
                        ? room.number
                        : reservation.roomNumber ?? room ?? '—';
                    const guestDisplay =
                      typeof guest === 'object'
                        ? `${guest.firstName} ${guest.lastName}`
                        : guest ?? reservation.guestName ?? '—';
                    const numberOfGuests = reservation.numberOfGuests ?? '—';
                    const status = reservation.status;

                    return (
                      <TableRow key={reservation._id}>
                        <TableCell className="font-medium">{roomDisplay}</TableCell>
                        <TableCell>{guestDisplay}</TableCell>
                        <TableCell>{formatDate(reservation.checkIn)}</TableCell>
                        <TableCell>{formatDate(reservation.checkOut)}</TableCell>
                        <TableCell>{numberOfGuests}</TableCell>
                        <TableCell>${reservation.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/reservations/${reservation._id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reservations && reservations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No hay reservaciones</h3>
              <p className="mb-4 text-muted-foreground">
                Comienza creando tu primera reservación
              </p>
              <Link href="/reservations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Reservación
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
