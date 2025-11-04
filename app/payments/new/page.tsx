import { Suspense } from 'react';

import { Navbar } from '@/components/layout/Navbar';
import { PaymentForm } from '@/components/payments/PaymentForm';

export default function NewPaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Suspense
            fallback={
              <div className="rounded-lg border border-muted bg-muted/30 p-8 text-center text-muted-foreground">
                Cargando formulario de pago...
              </div>
            }
          >
            <PaymentForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
