'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRoom, useUpdateRoom } from '@/lib/hooks/useRooms';
import { roomSchema, type RoomFormValues } from '@/lib/schemas/room';
import { useRouter } from 'next/navigation';

interface RoomFormProps {
  mode?: 'create' | 'edit';
  roomId?: string;
  defaultValues?: Partial<RoomFormValues> & {
    amenitiesArray?: string[];
  };
}

const roomTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'doble', label: 'Doble' },
  { value: 'suite', label: 'Suite' },
  { value: 'familiar', label: 'Familiar' },
];

export function RoomForm({ mode = 'create', roomId, defaultValues }: RoomFormProps) {
  const router = useRouter();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const [apiError, setApiError] = useState<string | null>(null);

  const normalizedDefaults = useMemo(() => {
    const base: RoomFormValues = {
      number: '',
      type: 'individual',
      capacity: 1,
      pricePerNight: 0,
      amenities: '',
      isAvailable: true,
      description: '',
    };

    if (!defaultValues) {
      return base;
    }

    return {
      ...base,
      ...defaultValues,
      amenities: defaultValues.amenitiesArray?.join(', ') ?? defaultValues.amenities ?? '',
    } satisfies RoomFormValues;
  }, [defaultValues]);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: normalizedDefaults,
  });

  useEffect(() => {
    form.reset(normalizedDefaults);
  }, [normalizedDefaults, form]);

  const onSubmit = async (values: RoomFormValues) => {
    setApiError(null);

    const payload = {
      number: values.number,
      type: values.type,
      capacity: Number(values.capacity),
      pricePerNight: Number(values.pricePerNight),
      isAvailable: values.isAvailable ?? true,
      amenities: values.amenities
        ? values.amenities
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      description: values.description?.trim() ? values.description.trim() : undefined,
    };

    try {
      if (mode === 'edit' && roomId) {
        await updateRoom.mutateAsync({ id: roomId, data: payload });
        router.push(`/rooms/${roomId}`);
      } else {
        await createRoom.mutateAsync(payload);
        router.push('/rooms');
      }
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error al guardar la habitación.';
      setApiError(message);
    }
  };

  const isSubmitting =
    form.formState.isSubmitting || createRoom.isPending || updateRoom.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roomTypeOptions.map((option) => (
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value !== undefined ? String(field.value) : ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerNight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por noche</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={field.value !== undefined ? String(field.value) : ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenidades</FormLabel>
              <FormControl>
                <Input placeholder="Ej. WiFi, Aire acondicionado, TV" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Opcional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Disponible</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Indica si la habitación se encuentra disponible.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear habitación'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
