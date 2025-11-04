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
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGuests } from '@/lib/hooks/useGuests';
import { Plus, Users, Mail, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

const documentTypeLabels = {
  ine: 'INE',
  pasaporte: 'Pasaporte',
  licencia: 'Licencia',
  otro: 'Otro',
};

export default function GuestsPage() {
  const { data, isLoading, error } = useGuests();
  const guests = data?.guests || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Huéspedes</h1>
            <p className="mt-2 text-muted-foreground">Gestiona la información de los huéspedes</p>
          </div>
          <Link href="/guests/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Huésped
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Cargando huéspedes...</div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error al cargar huéspedes. Verifica que la API esté corriendo.
              </p>
            </CardContent>
          </Card>
        )}

        {guests && guests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Huéspedes</CardTitle>
              <CardDescription>
                {total} huésped{total !== 1 ? 'es' : ''} registrado{total !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {guest.email}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {guest.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {documentTypeLabels[guest.documentType]}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {guest.documentNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/guests/${guest.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {guests && guests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No hay huéspedes registrados</h3>
              <p className="mb-4 text-muted-foreground">
                Comienza registrando tu primer huésped
              </p>
              <Link href="/guests/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Huésped
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
