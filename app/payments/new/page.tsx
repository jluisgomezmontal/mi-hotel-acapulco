import { Navbar } from '@/components/layout/Navbar';
import { PaymentForm } from '@/components/payments/PaymentForm';

export default function NewPaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <PaymentForm />
        </div>
      </main>
    </div>
  );
}
