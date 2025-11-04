import { z } from 'zod';

export const paymentFormSchema = z.object({
  reservationId: z.string().trim().min(1, 'Selecciona una reservación').optional(),
  amount: z
    .coerce.number()
    .positive('El monto debe ser mayor a 0')
    .max(1000000, 'El monto no puede exceder 1,000,000'),
  method: z.enum(['efectivo', 'tdd', 'tdc'], {
    message: 'Selecciona un método de pago válido',
  }),
  notes: z
    .string()
    .trim()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type PaymentFormValues = z.input<typeof paymentFormSchema>;
export type PaymentFormParsedValues = z.output<typeof paymentFormSchema>;
