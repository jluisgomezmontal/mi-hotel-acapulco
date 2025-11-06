'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { RoomForm } from '@/components/rooms/RoomForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoom } from '@/lib/hooks/useRooms';
import type { Room } from '@/lib/types';

export default function EditRoomPage() {
  const params = useParams<{ id: string }>();
  const roomId = params?.id;

  const {
    data: room,
    isLoading,
    error,
  } = useRoom(roomId);

  const defaultValues = useMemo(() => {
    if (!room) return undefined;

    const rawAmenities = room.amenities as unknown;
    const amenitiesArray: string[] = Array.isArray(rawAmenities)
      ? rawAmenities
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : typeof rawAmenities === 'string'
        ? rawAmenities
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [];

    return {
      number: room.number != null ? String(room.number) : '',
      type: room.type ?? 'individual',
      capacity: room.capacity ?? 1,
      pricePerNight: room.pricePerNight ?? 0,
      isAvailable: room.isAvailable ?? true,
      description: room.description ?? '',
      amenitiesArray,
    };
  }, [room]);

  const renderContent = () => {
    if (!roomId) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No se proporcionó un identificador de habitación válido.
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card>
          <CardContent className="flex items-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando información de la habitación...
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="py-6">
            <p className="text-destructive">
              Ocurrió un error al cargar la habitación. Verifica la conexión con la API e intenta nuevamente.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (!room || !defaultValues) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No se encontró información para esta habitación.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Editar habitación</CardTitle>
          <CardDescription>Actualiza los datos de la habitación seleccionada.</CardDescription>
        </CardHeader>
        <CardContent>
          <RoomForm mode="edit" roomId={roomId} defaultValues={defaultValues} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar habitación</h1>
            <p className="mt-1 text-muted-foreground">
              Modifica la información y disponibilidad de la habitación seleccionada.
            </p>
          </div>
          <Link href={roomId ? `/rooms/${roomId}` : '/rooms'}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
