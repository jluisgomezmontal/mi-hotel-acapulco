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
import { usePayments } from '@/lib/hooks/usePayments';
import { Plus, CreditCard, DollarSign } from 'lucide-react';
import Link from 'next/link';
import type { Payment, Reservation, Guest } from '@/lib/types';

const methodLabels = {
  efectivo: 'Efectivo',
  tdd: 'Tarjeta de Débito',
  tdc: 'Tarjeta de Crédito',
};

const methodColors = {
  efectivo: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  tdd: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  tdc: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200',
};

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = usePayments();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalAmount = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Pagos</h1>
            <p className="mt-2 text-muted-foreground">Gestiona los pagos y abonos de reservaciones</p>
          </div>
          <Link href="/payments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          </Link>
        </div>

        {payments && payments.length > 0 && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {payments.length} pago{payments.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pago Promedio</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payments.length > 0 ? (totalAmount / payments.length).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Por transacción</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {payments
                    .filter((p) => p.method === 'efectivo')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter((p) => p.method === 'efectivo').length} pago
                  {payments.filter((p) => p.method === 'efectivo').length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Cargando pagos...</div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error al cargar pagos. Verifica que la API esté corriendo.
              </p>
            </CardContent>
          </Card>
        )}

        {payments && payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pagos</CardTitle>
              <CardDescription>
                {payments.length} pago{payments.length !== 1 ? 's' : ''} registrado
                {payments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Huésped</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: Payment) => {
                    const guest = payment.guest as Guest;

                    return (
                      <TableRow key={payment._id}>
                        <TableCell className="font-medium">
                          {formatDate(payment.date)}
                        </TableCell>
                        <TableCell>
                          {typeof guest === 'object'
                            ? `${guest.firstName} ${guest.lastName}`
                            : 'Huésped'}
                        </TableCell>
                        <TableCell>
                          <Badge className={methodColors[payment.method]}>
                            {methodLabels[payment.method]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {payment.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/payments/${payment._id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {payments && payments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No hay pagos registrados</h3>
              <p className="mb-4 text-muted-foreground">Comienza registrando el primer pago</p>
              <Link href="/payments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Pago
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
