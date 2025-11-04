'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDeleteRoom, useRoom, useUpdateRoomAvailability } from '@/lib/hooks/useRooms';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
  LucideIcon,
  Pencil,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';

const roomTypeLabels: Record<string, string> = {
  individual: 'Individual',
  doble: 'Doble',
  suite: 'Suite',
  familiar: 'Familiar',
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = params?.id;

  const { data: room, isLoading, error } = useRoom(roomId);
  const updateAvailability = useUpdateRoomAvailability();
  const deleteRoom = useDeleteRoom();
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const priceLabel = useMemo(() => {
    if (!room?.pricePerNight && room?.pricePerNight !== 0) {
      return 'No disponible';
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(room.pricePerNight);
  }, [room?.pricePerNight]);

  const createdAtLabel = useMemo(() => {
    if (!room?.createdAt) return null;
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(room.createdAt));
  }, [room?.createdAt]);

  const updatedAtLabel = useMemo(() => {
    if (!room?.updatedAt) return null;
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(room.updatedAt));
  }, [room?.updatedAt]);

  const handleToggleAvailability = async () => {
    if (!roomId || !room) return;
    setAvailabilityError(null);
    try {
      await updateAvailability.mutateAsync({
        id: roomId,
        available: !room.isAvailable,
      });
      setIsDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar la disponibilidad.';
      setAvailabilityError(message);
    }
  };

  const handleDelete = async () => {
    if (!roomId) return;
    setDeleteError(null);
    try {
      await deleteRoom.mutateAsync(roomId);
      setIsDeleteDialogOpen(false);
      router.push('/rooms');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la habitación.';
      setDeleteError(message);
    }
  };

  const AvailabilityIcon: LucideIcon = room?.isAvailable ? CheckCircle2 : XCircle;
  const availabilityLabel = room?.isAvailable ? 'Disponible' : 'Ocupada';
  const availabilityVariant = room?.isAvailable ? 'default' : 'secondary';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detalle de la habitación</h1>
            <p className="mt-1 text-muted-foreground">
              Consulta la información y disponibilidad de la habitación seleccionada.
            </p>
          </div>
          <Link href="/rooms">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a habitaciones
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando información de la habitación...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="py-6">
              <p className="text-destructive">
                Ocurrió un error al cargar la habitación. Verifica la conexión con la API e intenta nuevamente.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !room && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No se encontró información para esta habitación.
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && room && (
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-foreground">
                  Habitación {room.number}
                </CardTitle>
                <CardDescription>
                  Tipo {roomTypeLabels[room.type] ?? room.type}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/rooms/${room._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                </Link>
                <Badge variant={availabilityVariant} className="flex items-center gap-1">
                  <AvailabilityIcon className="h-3.5 w-3.5" />
                  {availabilityLabel}
                </Badge>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={updateAvailability.isPending}>
                      Cambiar disponibilidad
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Actualizar disponibilidad</DialogTitle>
                      <DialogDescription>
                        ¿Quieres marcar esta habitación como {room.isAvailable ? 'ocupada' : 'disponible'}?
                      </DialogDescription>
                    </DialogHeader>
                    {availabilityError && (
                      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {availabilityError}
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleToggleAvailability}
                        disabled={updateAvailability.isPending}
                      >
                        {updateAvailability.isPending ? 'Guardando...' : 'Confirmar'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deleteRoom.isPending}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Eliminar habitación</DialogTitle>
                      <DialogDescription>
                        Esta acción es permanente. ¿Deseas eliminar la habitación {room.number}?
                      </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {deleteError}
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteRoom.isPending}
                      >
                        {deleteRoom.isPending ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="grid gap-6 md:grid-cols-2">
                <DetailItem icon={Users} label="Capacidad" value={`${room.capacity} personas`} />
                <DetailItem icon={DollarSign} label="Precio por noche" value={`${priceLabel} MXN`} />
                <DetailItem
                  icon={Info}
                  label="Tipo de habitación"
                  value={roomTypeLabels[room.type] ?? room.type}
                />
                <DetailItem
                  icon={CalendarClock}
                  label="Última actualización"
                  value={updatedAtLabel ?? 'Sin registro'}
                  helper={createdAtLabel ? `Creada el ${createdAtLabel}` : undefined}
                />
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Amenidades</h2>
                {room.amenities?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin amenidades registradas.</p>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Descripción</h2>
                <p className="text-sm text-muted-foreground">
                  {room.description?.trim() ? room.description : 'Sin descripción disponible.'}
                </p>
              </section>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
}

function DetailItem({ icon: Icon, label, value, helper }: DetailItemProps) {
  return (
    <div className="space-y-1 rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-sm text-muted-foreground">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}
