'use client';

import { RoomForm } from '@/components/rooms/RoomForm';
import { Card } from '@/components/ui/card';

export default function NewRoomPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <RoomForm />
      </Card>
    </div>
  );
}