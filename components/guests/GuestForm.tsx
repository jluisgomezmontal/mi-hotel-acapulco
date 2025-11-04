'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestSchema, type GuestFormValues } from '@/lib/schemas/guest';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateGuest, useUpdateGuest } from '@/lib/hooks/useGuests';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GuestFormProps {
  defaultValues?: Partial<GuestFormValues>;
  mode?: 'create' | 'edit';
  guestId?: string;
}

export function GuestForm({ defaultValues, mode = 'create', guestId }: GuestFormProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentType: 'ine',
      documentNumber: '',
      notes: '',
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        firstName: defaultValues.firstName ?? '',
        lastName: defaultValues.lastName ?? '',
        email: defaultValues.email ?? '',
        phone: defaultValues.phone ?? '',
        documentType: defaultValues.documentType ?? 'ine',
        documentNumber: defaultValues.documentNumber ?? '',
        notes: defaultValues.notes ?? '',
      });
    }
  }, [defaultValues, form]);

  const onSubmit = async (values: GuestFormValues) => {
    setApiError(null);

    try {
      const payload = {
        ...values,
        notes: values.notes?.trim() ? values.notes.trim() : undefined,
      };
      if (mode === 'edit' && guestId) {
        await updateGuest.mutateAsync({ id: guestId, data: payload });
        router.push(`/guests/${guestId}`);
      } else {
        await createGuest.mutateAsync(payload);
        router.push('/guests');
      }
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al registrar el huésped. Intenta de nuevo.';
      setApiError(message);
    }
  };

  const isSubmitting =
    form.formState.isSubmitting || createGuest.isPending || updateGuest.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Pérez" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de documento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? 'ine'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
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
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de documento</FormLabel>
                <FormControl>
                  <Input placeholder="ABC123456" {...field} value={field.value ?? ''} />
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
                <Textarea
                  placeholder="Notas adicionales sobre el huésped"
                  {...field}
                  value={field.value ?? ''}
                  rows={4}
                />
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
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Guardando...'
              : mode === 'edit'
              ? 'Guardar cambios'
              : 'Registrar Huésped'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
