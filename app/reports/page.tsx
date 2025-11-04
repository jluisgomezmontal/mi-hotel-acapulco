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

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: report, isLoading, error } = useMonthlyReport(selectedYear, selectedMonth);

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
                    {report.occupancyRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {months[selectedMonth - 1]} {selectedYear}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${report.totalIncome.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Ingresos del período</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservaciones</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalReservations}</div>
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
                    {report.cancellationRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {report.cancelledReservations} cancelaciones
                  </p>
                </CardContent>
              </Card>
            </div>

            {report.roomRevenueBreakdown && report.roomRevenueBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Habitación</CardTitle>
                  <CardDescription>
                    Desglose de ingresos y reservaciones por habitación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Habitación</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Reservaciones</TableHead>
                        <TableHead>Ingresos</TableHead>
                        <TableHead>Promedio por Reservación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.roomRevenueBreakdown.map((room) => (
                        <TableRow key={room.roomNumber}>
                          <TableCell className="font-medium">{room.roomNumber}</TableCell>
                          <TableCell className="capitalize text-muted-foreground">{room.roomType}</TableCell>
                          <TableCell>{room.reservations}</TableCell>
                          <TableCell className="font-semibold text-foreground">
                            ${room.revenue.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            $
                            {room.reservations > 0
                              ? (room.revenue / room.reservations).toFixed(2)
                              : '0.00'}
                          </TableCell>
                        </TableRow>
                      ))}
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
