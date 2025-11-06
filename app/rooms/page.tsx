'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRooms } from '@/lib/hooks/useRooms';
import { Plus, BedDouble, Users as UsersIcon, DollarSign } from 'lucide-react';
import Link from 'next/link';

const roomTypeLabels = {
  individual: 'Individual',
  doble: 'Doble',
  suite: 'Suite',
  familiar: 'Familiar',
};

export default function RoomsPage() {
  const { data: rooms, isLoading, error } = useRooms();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Habitaciones</h1>
            <p className="mt-2 text-muted-foreground">Gestiona las habitaciones del hotel</p>
          </div>
          <Link href="/rooms/new">
            <Button size="sm" className="md:h-9 md:px-4 md:gap-2 md:has-[>svg]:px-3">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Habitación
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Cargando habitaciones...</div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error al cargar habitaciones. Verifica que la API esté corriendo en{' '}
                <code className="rounded bg-destructive/20 px-2 py-1">http://localhost:3000</code>
              </p>
            </CardContent>
          </Card>
        )}

        {rooms && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">Habitación {room.number}</CardTitle>
                      <CardDescription className="mt-1">
                        {roomTypeLabels[room.type]}
                      </CardDescription>
                    </div>
                    <Badge variant={room.isAvailable ? 'default' : 'secondary'}>
                      {room.isAvailable ? 'Disponible' : 'Ocupada'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      <span>Capacidad: {room.capacity} personas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-lg font-semibold text-foreground">
                        ${Number(room.pricePerNight ?? 0).toFixed(2)} / noche
                      </span>
                    </div>

                    {room.amenities && room.amenities.length > 0 && (
                      <div className="pt-2">
                        <p className="mb-2 text-sm font-medium">Amenidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {room.description && (
                      <p className="pt-2 text-sm text-muted-foreground">{room.description}</p>
                    )}

                    <div className="pt-4">
                      <Link href={`/rooms/${room._id}`}>
                        <Button variant="outline" className="w-full">
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {rooms && rooms.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BedDouble className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No hay habitaciones registradas</h3>
              <p className="mb-4 text-muted-foreground">
                Comienza agregando tu primera habitación
              </p>
              <Link href="/rooms/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Habitación
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
