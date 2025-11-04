'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useMonthlyReport } from '@/lib/hooks/useReports';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: report, isLoading, error } = useMonthlyReport(selectedYear, selectedMonth);
  const safeOccupancyRate = toNumber(report?.occupancy?.occupancyRate);
  const safeRoomsCount = toNumber(report?.occupancy?.roomsCount);
  const safeTotalNightsBooked = toNumber(report?.occupancy?.totalNightsBooked);
  const safeTotalIncome = toNumber(report?.income?.totalIncome);
  const safeTotalReservations = toNumber(report?.cancellations?.totalReservations);
  const safeCancellationRate = toNumber(report?.cancellations?.cancellationRate);
  const safeCancelledReservations = toNumber(report?.cancellations?.cancelledReservations);
  const roomsIncome = report?.income?.byRoom ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Reportes</h1>
          <p className="mt-2 text-muted-foreground">
            Visualiza métricas y estadísticas del hotel
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seleccionar Período</CardTitle>
            <CardDescription>Elige el mes y año para ver el reporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Mes</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Año</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Cargando reporte...</div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error al cargar el reporte. Verifica que la API esté corriendo.
              </p>
            </CardContent>
          </Card>
        )}

        {report && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {safeOccupancyRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {report?.period?.label ?? `${months[selectedMonth - 1]} ${selectedYear}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {safeRoomsCount} habitaciones · {safeTotalNightsBooked} noches reservadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currencyFormatter.format(safeTotalIncome)}</div>
                  <p className="text-xs text-muted-foreground">Ingresos del período</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservaciones Totales</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeTotalReservations}</div>
                  <p className="text-xs text-muted-foreground">Total del mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Cancelación</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {safeCancellationRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {safeCancelledReservations} cancelaciones
                  </p>
                </CardContent>
              </Card>
            </div>

            {roomsIncome.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Habitación</CardTitle>
                  <CardDescription>
                    Desglose de ingresos y pagos registrados por habitación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Habitación</TableHead>
                        <TableHead>Ingresos</TableHead>
                        <TableHead>Pagos</TableHead>
                        <TableHead>Promedio por Pago</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roomsIncome.map((room) => {
                        const revenue = toNumber(room.totalIncome);
                        const paymentsCount = toNumber(room.paymentsCount);

                        return (
                          <TableRow key={room.roomNumber}>
                            <TableCell className="font-medium">{room.roomNumber}</TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {currencyFormatter.format(revenue)}
                            </TableCell>
                            <TableCell>{paymentsCount}</TableCell>
                            <TableCell>
                              {currencyFormatter.format(
                                paymentsCount > 0 ? revenue / paymentsCount : 0,
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
