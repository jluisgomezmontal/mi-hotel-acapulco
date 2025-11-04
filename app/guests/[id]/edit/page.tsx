'use client';

import { Navbar } from '@/components/layout/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GuestForm } from '@/components/guests/GuestForm';
import { useGuest } from '@/lib/hooks/useGuests';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditGuestPage() {
  const params = useParams<{ id: string }>();
  const guestId = params?.id;

  const { data: guest, isLoading, error } = useGuest(guestId);

  const defaultValues = guest
    ? {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        documentType: guest.documentType,
        documentNumber: guest.documentNumber,
        notes: guest.notes,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar huésped</h1>
            <p className="mt-1 text-muted-foreground">
              Actualiza la información del huésped seleccionado.
            </p>
          </div>
          <Link href={guestId ? `/guests/${guestId}` : '/guests'}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al detalle
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando datos del huésped...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="py-6">
              <p className="text-destructive">
                No se pudo cargar la información del huésped. Intenta nuevamente.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && guest && (
          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle>Información del huésped</CardTitle>
              <CardDescription>Modifica los datos necesarios y guarda los cambios.</CardDescription>
            </CardHeader>
            <CardContent>
              <GuestForm mode="edit" guestId={guestId} defaultValues={defaultValues} />
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
      </main>
    </div>
  );
}
