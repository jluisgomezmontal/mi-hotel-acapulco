import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuestForm } from '@/components/guests/GuestForm';

export default function NewGuestPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Registrar nuevo huésped</CardTitle>
            <CardDescription>
              Completa la información para registrar un huésped en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuestForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
