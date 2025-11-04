import { ReservationForm } from '@/components/reservations/ReservationForm';
import { Card } from '@/components/ui/card';

export default function NewReservationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <ReservationForm />
      </Card>
    </div>
  );
}
