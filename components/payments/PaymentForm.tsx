'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreatePayment } from '@/lib/hooks/usePayments';
import { useReservations } from '@/lib/hooks/useReservations';
import {
  paymentFormSchema,
  type PaymentFormParsedValues,
  type PaymentFormValues,
} from '@/lib/schemas/payment';
import type { Reservation } from '@/lib/types';

const methodOptions = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tdd', label: 'Tarjeta de Débito' },
  { value: 'tdc', label: 'Tarjeta de Crédito' },
];

export function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationIdFromQuery = searchParams.get('reservationId') ?? undefined;

  const { data: reservations, isLoading: isLoadingReservations, error: reservationsError } =
    useReservations();
  const createPayment = useCreatePayment();
  const [apiError, setApiError] = useState<string | null>(null);

  const validReservations = useMemo(() => {
    if (!reservations) return [] as Reservation[];
    return reservations.filter((reservation) => (reservation.balanceDue ?? 0) > 0);
  }, [reservations]);

  const form = useForm<PaymentFormValues, unknown, PaymentFormParsedValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      reservationId: reservationIdFromQuery ?? '',
      amount: 0,
      method: 'efectivo',
      notes: '',
    },
  });

  useEffect(() => {
    if (reservationIdFromQuery) {
      form.setValue('reservationId', reservationIdFromQuery);
      return;
    }

    if (!form.getValues('reservationId') && validReservations.length > 0) {
      form.setValue('reservationId', validReservations[0]._id ?? '');
    }
  }, [reservationIdFromQuery, validReservations, form]);

  const selectedReservationId = form.watch('reservationId');
  const selectedReservation = useMemo(() => {
    if (!selectedReservationId) return undefined;
    return reservations?.find((reservation) => reservation._id === selectedReservationId);
  }, [reservations, selectedReservationId]);

  useEffect(() => {
    if (!selectedReservation) return;
    form.setValue('amount', selectedReservation.balanceDue ?? 0);
  }, [selectedReservation, form]);

  const handleSubmit = async (values: PaymentFormParsedValues) => {
    setApiError(null);

    if (!values.reservationId) {
      form.setError('reservationId', {
        type: 'manual',
        message: 'Selecciona una reservación',
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        reservationId: values.reservationId,
        amount: Number(values.amount),
        method: values.method,
        notes: values.notes?.trim() || undefined,
      });

      if (values.reservationId) {
        router.push(`/reservations/${values.reservationId}`);
      } else {
        router.push('/payments');
      }
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error al registrar el pago.';
      setApiError(message);
    }
  };

  const balanceDue = selectedReservation?.balanceDue ?? 0;
  const totalPrice = selectedReservation?.totalPrice ?? 0;
  const totalPaid = selectedReservation?.totalPaid ?? 0;
  const canSubmit = Boolean(selectedReservation && balanceDue > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar pago</CardTitle>
        <CardDescription>Aplica un nuevo pago a una reservación existente.</CardDescription>
      </CardHeader>
      <CardContent>
        {reservationsError && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Error al cargar la lista de reservaciones. Intenta nuevamente.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reservationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reservación</FormLabel>
                  <Select
                    disabled={
                      isLoadingReservations ||
                      createPayment.isPending ||
                      validReservations.length === 0
                    }
                    value={field.value ?? ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una reservación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validReservations.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No hay reservaciones con saldo pendiente
                        </div>
                      ) : (
                        validReservations.map((reservation) => (
                        <SelectItem key={reservation._id} value={reservation._id}>
                          Habitación {reservation.roomNumber ?? '—'} · {reservation.guestName ?? '—'} ·
                          Saldo {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(reservation.balanceDue ?? 0)}
                        </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReservation && (
              <div className="grid gap-4 rounded-md border border-muted p-4 text-sm text-muted-foreground md:grid-cols-3">
                <div>
                  <p className="font-semibold text-foreground">Huésped</p>
                  <p>{selectedReservation.guestName ?? '—'}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Monto total</p>
                  <p>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    }).format(totalPrice)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Saldo pendiente</p>
                  <Badge variant={balanceDue > 0 ? 'secondary' : 'outline'}>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    }).format(balanceDue)}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Pagado</p>
                  <p>
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    }).format(totalPaid ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Check-in</p>
                  <p>{new Date(selectedReservation.checkIn).toLocaleDateString('es-MX')}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Check-out</p>
                  <p>{new Date(selectedReservation.checkOut).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            )}

            {validReservations.length === 0 && !isLoadingReservations && (
              <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
                No hay reservaciones con saldo pendiente. Crea una nueva reservación o revisa los pagos existentes.
              </div>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={field.value === undefined ? '' : String(field.value)}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        field.onChange(nextValue === '' ? undefined : Number(nextValue));
                      }}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={createPayment.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {methodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Detalles adicionales" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {apiError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {apiError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={createPayment.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPayment.isPending || !canSubmit}>
                {createPayment.isPending ? 'Registrando...' : 'Registrar pago'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
