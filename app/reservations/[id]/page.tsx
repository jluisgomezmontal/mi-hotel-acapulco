'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRooms } from '@/lib/hooks/useRooms';
import { useReservation, useUpdateReservation, useUpdateReservationStatus } from '@/lib/hooks/useReservations';
import type { Guest, Reservation, ReservationFormData, Room } from '@/lib/types';
import {
  reservationUpdateSchema,
  type ReservationUpdateFormValues,
} from '@/lib/schemas/reservation';
import { Label } from '@/components/ui/label';

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
  'checked-in': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  'checked-out': 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-foreground',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const reservationId = params?.id ?? '';
  const { data: reservation, isLoading, error } = useReservation(reservationId);
  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useRooms();
  const updateReservation = useUpdateReservation();
  const updateReservationStatus = useUpdateReservationStatus();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<Reservation['status']>('pending');

  const form = useForm<ReservationUpdateFormValues>({
    resolver: zodResolver(reservationUpdateSchema),
    defaultValues: {
      roomNumber: reservation?.roomNumber ?? (reservation?.room as Room | undefined)?.number ?? 0,
      checkIn: reservation?.checkIn ? reservation.checkIn.slice(0, 10) : '',
      checkOut: reservation?.checkOut ? reservation.checkOut.slice(0, 10) : '',
      numberOfGuests: reservation?.numberOfGuests,
      notes: reservation?.notes ?? '',
    },
  });
  useEffect(() => {
    if (!reservation) return;
    form.reset({
      roomNumber: reservation.roomNumber ?? (reservation.room as Room | undefined)?.number ?? 0,
      checkIn: reservation.checkIn.slice(0, 10),
      checkOut: reservation.checkOut.slice(0, 10),
      numberOfGuests: reservation.numberOfGuests,
      notes: reservation.notes ?? '',
    });
    setStatusValue(reservation.status);
    setStatusError(null);
  }, [reservation, form]);

  const room = reservation?.room as Room | string | number | undefined;
  const guest = reservation?.guest as Guest | string | undefined;
  const roomDisplay =
    typeof room === 'object' ? room.number : reservation?.roomNumber ?? room ?? '—';
  const guestName =
    typeof guest === 'object'
      ? `${guest.firstName} ${guest.lastName}`
      : guest ?? reservation?.guestName ?? '—';
  const guestEmail =
    typeof guest === 'object' ? guest.email : reservation?.guestEmail ?? 'Sin correo';
  const guestPhone =
    typeof guest === 'object' ? guest.phone : reservation?.guestPhone ?? 'Sin teléfono';

  const rooms = useMemo(() => roomsData ?? [], [roomsData]);
  const roomNumberValue = form.watch('roomNumber');
  const checkInValue = form.watch('checkIn');

  const selectedRoom = useMemo(() => {
    const numericRoom = Number(roomNumberValue);
    if (!Number.isFinite(numericRoom) || numericRoom <= 0) return undefined;
    return rooms.find((currentRoom) => Number(currentRoom.number) === numericRoom);
  }, [rooms, roomNumberValue]);

  const statusOptions = useMemo(
    () =>
      (Object.keys(statusLabels) as Array<Reservation['status']>).map((value) => ({
        value,
        label: statusLabels[value],
      })),
    []
  );

  const onSubmit = async (values: ReservationUpdateFormValues) => {
    if (!reservationId) return;
    setApiError(null);
    const payload: ReservationFormData = {
      roomNumber: Number(values.roomNumber),
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      numberOfGuests:
        values.numberOfGuests !== undefined && values.numberOfGuests !== null
          ? Number(values.numberOfGuests)
          : undefined,
      notes: values.notes?.trim() || undefined,
    };

    try {
      await updateReservation.mutateAsync({ id: reservationId, data: payload });
      router.refresh();
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Ocurrió un error al actualizar la reservación.';
      setApiError(message);
    }
  };

  const isSaving = form.formState.isSubmitting || updateReservation.isPending;
  const isUpdatingStatus = updateReservationStatus.isPending;

  const handleStatusChange = async (nextStatus: Reservation['status']) => {
    if (!reservationId) return;
    if (nextStatus === statusValue) return;
    setStatusError(null);
    setStatusValue(nextStatus);

    try {
      await updateReservationStatus.mutateAsync({ id: reservationId, status: nextStatus });
      router.refresh();
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Ocurrió un error al actualizar el estado.';
      setStatusError(message);
      setStatusValue(reservation?.status ?? statusValue);
    }
  };

  const minCheckoutDate = useMemo(() => {
    if (!checkInValue) return undefined;
    const checkInDate = new Date(checkInValue);
    if (Number.isNaN(checkInDate.getTime())) return undefined;
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, [checkInValue]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detalle de reservación</h1>
            <p className="text-sm text-muted-foreground">ID: {reservationId}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link href="/reservations">
              <Button variant="outline" size="sm">
                Volver a reservaciones
              </Button>
            </Link>
            {reservationId && (
              <Link href={`/payments/new?reservationId=${reservationId}`}>
                <Button size="sm" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Registrar pago
                </Button>
              </Link>
            )}
          </div>
        </div>

        {!reservationId && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                No se proporcionó un identificador de reservación válido.
              </p>
            </CardContent>
          </Card>
        )}

        {reservationId && isLoading && (
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-4 w-56 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        )}

        {reservationId && error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Ocurrió un error al cargar la reservación. Verifica la conexión e inténtalo de nuevo.
              </p>
            </CardContent>
          </Card>
        )}

        {reservationId && !isLoading && !error && !reservation && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No se encontró la reservación solicitada. Puede que haya sido eliminada o que el
                identificador sea incorrecto.
              </p>
            </CardContent>
          </Card>
        )}

        {reservation && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Editar reservación</CardTitle>
                  <CardDescription>Actualiza fechas, habitación y notas.</CardDescription>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <Badge className={statusColors[reservation.status]}>
                    {statusLabels[reservation.status]}
                  </Badge>
                  <div className="space-y-2">
                    <Label htmlFor="reservation-status">Cambiar estado</Label>
                    <Select
                      value={statusValue}
                      onValueChange={(value) => handleStatusChange(value as Reservation['status'])}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger id="reservation-status">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {statusError && (
                      <p className="text-sm text-destructive">{statusError}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="roomNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Habitación</FormLabel>
                            <Select
                              disabled={isLoadingRooms}
                              value={
                                field.value === undefined || field.value === null || Number(field.value) <= 0
                                  ? ''
                                  : String(field.value)
                              }
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingRooms
                                        ? 'Cargando habitaciones...'
                                        : rooms.length
                                        ? 'Selecciona una habitación'
                                        : 'No hay habitaciones disponibles'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {rooms.map((currentRoom) => (
                                  <SelectItem key={currentRoom._id} value={String(currentRoom.number)}>
                                    Habitación {currentRoom.number} · {currentRoom.type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            {selectedRoom && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Capacidad: {selectedRoom.capacity} · Precio por noche: $
                                {Number(selectedRoom.pricePerNight).toFixed(2)}
                              </p>
                            )}
                            {roomsError && (
                              <p className="mt-2 text-xs text-destructive">
                                Error al cargar habitaciones disponibles.
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Huéspedes</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                value={
                                  field.value === undefined || field.value === null
                                    ? ''
                                    : String(field.value)
                                }
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  field.onChange(nextValue === '' ? undefined : Number(nextValue));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="checkIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-in</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="checkOut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-out</FormLabel>
                            <FormControl>
                              <Input type="date" min={minCheckoutDate} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {apiError && (
                      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {apiError}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen actual</CardTitle>
                  <CardDescription>Información guardada en la reservación.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Detail label="Habitación" value={roomDisplay?.toString() ?? '—'} />
                  <Detail label="Huéspedes" value={`${reservation.numberOfGuests ?? '—'}`} />
                  <Detail label="Check-in" value={formatDate(reservation.checkIn)} />
                  <Detail label="Check-out" value={formatDate(reservation.checkOut)} />
                  <Detail
                    label="Precio total"
                    value={currencyFormatter.format(reservation.totalPrice)}
                  />
                  <Detail
                    label="Total pagado"
                    value={
                      reservation.totalPaid !== undefined
                        ? currencyFormatter.format(reservation.totalPaid)
                        : 'No registrado'
                    }
                  />
                  <Detail
                    label="Saldo pendiente"
                    value={
                      reservation.balanceDue !== undefined
                        ? currencyFormatter.format(reservation.balanceDue)
                        : 'No registrado'
                    }
                  />
                  <Detail
                    label="Última actualización"
                    value={formatDateTime(reservation.updatedAt)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información del huésped</CardTitle>
                  <CardDescription>Datos de contacto del huésped asociado.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Detail label="Nombre" value={guestName} />
                  <Detail label="Correo" value={guestEmail} />
                  <Detail label="Teléfono" value={guestPhone} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface DetailProps {
  label: string;
  value: string;
}

function Detail({ label, value }: DetailProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
