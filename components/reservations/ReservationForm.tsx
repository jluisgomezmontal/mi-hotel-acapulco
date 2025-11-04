'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReservation } from '@/lib/hooks/useReservations';
import { useGuests } from '@/lib/hooks/useGuests';
import { useRooms } from '@/lib/hooks/useRooms';
import {
  reservationFormSchema,
  type ReservationFormValues,
} from '@/lib/schemas/reservation';
import { useRouter } from 'next/navigation';

import type { Guest, ReservationFormData, Room } from '@/lib/types';

type GuestForm = NonNullable<ReservationFormValues['guest']>;

const NEW_GUEST_DEFAULT: GuestForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  documentType: undefined,
  documentNumber: '',
  notes: '',
};

export function ReservationForm() {
  const router = useRouter();
  const createReservation = useCreateReservation();
  const { data: roomsData, isLoading: isLoadingRooms, error: roomsError } = useRooms();
  const {
    data: guestsData,
    isLoading: isLoadingGuests,
    error: guestsError,
  } = useGuests({ limit: 100 });

  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      roomNumber: 0,
      checkIn: '',
      checkOut: '',
      numberOfGuests: 1,
      notes: '',
      mode: 'existing',
      guestId: '',
      guest: undefined,
    },
  });

  const mode = form.watch('mode');
  const roomNumberValue = form.watch('roomNumber');
  const checkInValue = form.watch('checkIn');

  const rooms = useMemo(() => roomsData?.filter((room) => room.isAvailable) ?? [], [roomsData]);
  const guests = useMemo(() => guestsData?.guests ?? [], [guestsData]);

  useEffect(() => {
    if (mode === 'existing') {
      form.setValue('guest', undefined, { shouldValidate: true });
    } else {
      const currentGuest = form.getValues('guest');
      form.setValue('guest', currentGuest ?? { ...NEW_GUEST_DEFAULT }, { shouldValidate: !true });
      form.setValue('guestId', '', { shouldValidate: true });
    }
  }, [mode, form]);

  useEffect(() => {
    if (!checkInValue) return;

    const checkOutValue = form.getValues('checkOut');
    if (!checkOutValue) return;

    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return;
    }

    if (checkOutDate <= checkInDate) {
      form.setValue('checkOut', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [checkInValue, form]);

  const selectedRoom = useMemo(() => {
    const numericRoom = Number(roomNumberValue);
    if (!Number.isFinite(numericRoom) || numericRoom <= 0) return undefined;
    return rooms.find((room) => Number(room.number) === numericRoom);
  }, [rooms, roomNumberValue]);

  const minCheckoutDate = useMemo(() => {
    if (!checkInValue) return undefined;
    const checkInDate = new Date(checkInValue);
    if (Number.isNaN(checkInDate.getTime())) return undefined;
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, [checkInValue]);

  const onSubmit = async (values: ReservationFormValues) => {
    setApiError(null);

    const roomNumber = Number(values.roomNumber);
    const numberOfGuests =
      values.numberOfGuests !== undefined && values.numberOfGuests !== null
        ? Number(values.numberOfGuests)
        : undefined;

    const payload: ReservationFormData = {
      roomNumber,
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      numberOfGuests,
      notes: values.notes?.trim() || undefined,
    };

    if (values.mode === 'existing') {
      payload.guestId = values.guestId || undefined;
    } else if (values.guest) {
      payload.guest = {
        firstName: values.guest.firstName.trim(),
        lastName: values.guest.lastName.trim(),
        email: values.guest.email.trim(),
        phone: values.guest.phone.trim(),
        documentType: values.guest.documentType,
        documentNumber: values.guest.documentNumber?.trim() || undefined,
        notes: values.guest.notes?.trim() || undefined,
      };
    }

    try {
      await createReservation.mutateAsync(payload);
      router.push('/reservations');
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error al crear la reservación.';
      setApiError(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting || createReservation.isPending;

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Nueva reservación</CardTitle>
        <CardDescription>Completa la información para registrar una reservación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habitación</FormLabel>
                    <Select
                      disabled={isLoadingRooms || !!roomsError}
                      value={field.value && Number(field.value) > 0 ? String(field.value) : ''}
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
                        {rooms.map((room: Room) => (
                          <SelectItem key={room._id} value={String(Number(room.number))}>
                            Habitación {room.number} · {room.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {selectedRoom && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Capacidad: {selectedRoom.capacity} · Precio por noche: ${' '}
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

              <div className="grid gap-6 md:grid-cols-2 md:col-span-1">
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
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => {
                  const inputValue =
                    field.value === undefined || field.value === null
                      ? ''
                      : String(field.value);

                  return (
                    <FormItem>
                      <FormLabel>Número de huéspedes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={selectedRoom?.capacity ?? 10}
                          value={inputValue}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            field.onChange(nextValue === '' ? undefined : Number(nextValue));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Información del huésped</h2>
                <p className="text-sm text-muted-foreground">
                  Elige un huésped existente o ingresa los datos de un nuevo huésped.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={mode === 'existing' ? 'default' : 'outline'}
                  onClick={() => form.setValue('mode', 'existing', { shouldValidate: true })}
                >
                  Huésped existente
                </Button>
                <Button
                  type="button"
                  variant={mode === 'new' ? 'default' : 'outline'}
                  onClick={() => form.setValue('mode', 'new', { shouldValidate: true })}
                >
                  Nuevo huésped
                </Button>
              </div>

              {mode === 'existing' ? (
                <FormField
                  control={form.control}
                  name="guestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecciona huésped</FormLabel>
                      <Select
                        disabled={isLoadingGuests || !!guestsError}
                        value={field.value ?? ''}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingGuests
                                  ? 'Cargando huéspedes...'
                                  : guests.length
                                  ? 'Selecciona un huésped'
                                  : 'No se encontraron huéspedes'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guests.map((guest) => {
                            const guestId = (guest as Guest & { _id?: string })._id ?? guest.id;
                            const label = `${guest.firstName} ${guest.lastName} · ${guest.email}`;
                            return (
                              <SelectItem key={guestId} value={guestId}>
                                {label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {guestsError && (
                        <p className="mt-2 text-xs text-destructive">
                          Error al cargar huéspedes. Intenta nuevamente.
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="guest.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest.documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de documento</FormLabel>
                        <Select
                          value={field.value ?? ''}
                          onValueChange={(value) => field.onChange(value || undefined)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ine">INE</SelectItem>
                            <SelectItem value="pasaporte">Pasaporte</SelectItem>
                            <SelectItem value="licencia">Licencia</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest.documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de documento</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest.notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notas del huésped</FormLabel>
                        <FormControl>
                          <Textarea rows={3} value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </section>

            {apiError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {apiError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Crear reservación'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
