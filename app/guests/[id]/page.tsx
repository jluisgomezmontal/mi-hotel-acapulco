'use client';

import { Navbar } from '@/components/layout/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDeleteGuest, useGuest } from '@/lib/hooks/useGuests';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2, Mail, Phone, StickyNote } from 'lucide-react';
import { useState } from 'react';

const documentTypeLabels: Record<string, string> = {
  ine: 'INE',
  pasaporte: 'Pasaporte',
  licencia: 'Licencia',
  otro: 'Otro',
};

export default function GuestDetailPage() {
  const params = useParams<{ id: string }>();
  const guestId = params?.id;

  const { data: guest, isLoading, error } = useGuest(guestId);
  const deleteGuest = useDeleteGuest();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!guestId) return;
    setDeleteError(null);
    try {
      await deleteGuest.mutateAsync(guestId);
      setIsDialogOpen(false);
      router.push('/guests');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el huésped.';
      setDeleteError(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detalle del huésped</h1>
            <p className="mt-1 text-muted-foreground">
              Consulta la información registrada del huésped seleccionado.
            </p>
          </div>
          <Link href="/guests">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a huéspedes
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando información del huésped...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="py-6">
              <p className="text-destructive">
                Ocurrió un error al cargar los datos del huésped. Intenta nuevamente.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !guest && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No se encontró información para este huésped.
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && guest && (
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-foreground">
                  {guest.firstName} {guest.lastName}
                </CardTitle>
                <CardDescription>
                  Registrado el{' '}
                  {new Intl.DateTimeFormat('es-MX', {
                    dateStyle: 'long',
                  }).format(new Date(guest.createdAt))}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/guests/${guest.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deleteGuest.isPending}>
                      Eliminar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Eliminar huésped</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminará toda la información del
                        huésped.
                      </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {deleteError}
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteGuest.isPending}
                      >
                        {deleteGuest.isPending ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {guest.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {guest.phone}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Documento</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <Badge variant="outline">
                        {documentTypeLabels[guest.documentType] ?? guest.documentType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {guest.documentNumber}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Notas</h2>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <StickyNote className="mt-0.5 h-4 w-4" />
                  <span>{guest.notes?.trim() ? guest.notes : 'Sin notas adicionales'}</span>
                </div>
              </section>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
