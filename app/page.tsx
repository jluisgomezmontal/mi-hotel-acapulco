import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Calendar, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Bienvenido al sistema de gestión hotelera de Mi Hotel Acapulco
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/rooms">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habitaciones</CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">-</div>
                <CardDescription>Total de habitaciones</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reservations">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservaciones</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">-</div>
                <CardDescription>Reservaciones activas</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/guests">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Huéspedes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">-</div>
                <CardDescription>Total de huéspedes</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/payments">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">-</div>
                <CardDescription>Pagos del mes</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido</CardTitle>
              <CardDescription>Gestiona tu hotel desde un solo lugar</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/rooms"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <BedDouble className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Gestionar Habitaciones</h3>
                  <p className="text-sm text-muted-foreground">
                    Agregar, editar y ver habitaciones
                  </p>
                </div>
              </Link>

              <Link
                href="/reservations"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Nueva Reservación</h3>
                  <p className="text-sm text-muted-foreground">Crear y gestionar reservaciones</p>
                </div>
              </Link>

              <Link
                href="/guests"
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Registrar Huésped</h3>
                  <p className="text-sm text-muted-foreground">Gestionar información de huéspedes</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
