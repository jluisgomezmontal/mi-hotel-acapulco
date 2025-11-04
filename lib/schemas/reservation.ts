import { z } from 'zod';

const documentTypes = ['ine', 'pasaporte', 'licencia', 'otro'] as const;

export const reservationFormSchema = z
  .object({
    roomNumber: z.coerce.number().int('La habitación debe ser un número entero').positive(),
    checkIn: z.string().min(1, 'La fecha de check-in es obligatoria'),
    checkOut: z.string().min(1, 'La fecha de check-out es obligatoria'),
    numberOfGuests: z
      .coerce
      .number()
      .int('Debe ser un número entero')
      .min(1, 'Al menos un huésped')
      .max(10, 'Máximo 10 huéspedes')
      .optional(),
    notes: z
      .string()
      .trim()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .optional()
      .or(z.literal('')),
    mode: z.enum(['existing', 'new']).default('existing'),
    guestId: z.string().trim().optional(),
    guest: z.object({
      firstName: z.string().trim().min(1, 'Ingresa el nombre'),
      lastName: z.string().trim().min(1, 'Ingresa el apellido'),
      email: z.string().trim().email('Correo inválido'),
      phone: z.string().trim().min(7, 'Teléfono inválido'),
      documentType: z.enum(documentTypes).optional(),
      documentNumber: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
      notes: z
        .string()
        .trim()
        .max(300, 'Las notas no pueden exceder 300 caracteres')
        .optional()
        .or(z.literal('')),
    }).optional(),
  })
  .superRefine((values, ctx) => {
    const checkInDate = new Date(values.checkIn);
    const checkOutDate = new Date(values.checkOut);

    if (Number.isNaN(checkInDate.getTime())) {
      ctx.addIssue({
        path: ['checkIn'],
        code: z.ZodIssueCode.custom,
        message: 'Fecha inválida',
      });
    }

    if (Number.isNaN(checkOutDate.getTime())) {
      ctx.addIssue({
        path: ['checkOut'],
        code: z.ZodIssueCode.custom,
        message: 'Fecha inválida',
      });
    }

    if (!Number.isNaN(checkInDate.getTime()) && !Number.isNaN(checkOutDate.getTime())) {
      if (checkOutDate <= checkInDate) {
        ctx.addIssue({
          path: ['checkOut'],
          code: z.ZodIssueCode.custom,
          message: 'La salida debe ser posterior al check-in',
        });
      }
    }

    if (values.mode === 'existing') {
      if (!values.guestId) {
        ctx.addIssue({
          path: ['guestId'],
          code: z.ZodIssueCode.custom,
          message: 'Selecciona un huésped existente',
        });
      }
    } else if (values.mode === 'new') {
      if (!values.guest) {
        ctx.addIssue({
          path: ['guest'],
          code: z.ZodIssueCode.custom,
          message: 'Completa los datos del nuevo huésped',
        });
      }
    }
  });

export type ReservationFormValues = z.input<typeof reservationFormSchema>;
export type ReservationFormParsedValues = z.output<typeof reservationFormSchema>;
export const documentTypeOptions = documentTypes;

export const reservationUpdateSchema = z
  .object({
    roomNumber: z.coerce.number().int('La habitación debe ser un número entero').positive(),
    checkIn: z.string().min(1, 'La fecha de check-in es obligatoria'),
    checkOut: z.string().min(1, 'La fecha de check-out es obligatoria'),
    numberOfGuests: z
      .coerce.number()
      .int('Debe ser un número entero')
      .min(1, 'Al menos un huésped')
      .max(10, 'Máximo 10 huéspedes')
      .optional(),
    notes: z
      .string()
      .trim()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    const checkInDate = new Date(values.checkIn);
    const checkOutDate = new Date(values.checkOut);

    if (Number.isNaN(checkInDate.getTime())) {
      ctx.addIssue({
        path: ['checkIn'],
        code: z.ZodIssueCode.custom,
        message: 'Fecha inválida',
      });
    }

    if (Number.isNaN(checkOutDate.getTime())) {
      ctx.addIssue({
        path: ['checkOut'],
        code: z.ZodIssueCode.custom,
        message: 'Fecha inválida',
      });
    }

    if (!Number.isNaN(checkInDate.getTime()) && !Number.isNaN(checkOutDate.getTime())) {
      if (checkOutDate <= checkInDate) {
        ctx.addIssue({
          path: ['checkOut'],
          code: z.ZodIssueCode.custom,
          message: 'La salida debe ser posterior al check-in',
        });
      }
    }
  });

export type ReservationUpdateFormValues = z.input<typeof reservationUpdateSchema>;
export type ReservationUpdateFormParsedValues = z.output<typeof reservationUpdateSchema>;
