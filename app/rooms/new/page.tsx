import { Navbar } from '@/components/layout/Navbar';
import { RoomForm } from '@/components/rooms/RoomForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewRoomPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Nueva habitación</CardTitle>
            <CardDescription>
              Ingresa los detalles para agregar una nueva habitación al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoomForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}