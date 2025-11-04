import { z } from 'zod';

const roomTypes = ['individual', 'doble', 'suite', 'familiar'] as const;

export const roomSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, 'El número de habitación es obligatorio')
    .max(10, 'El número de habitación no puede exceder 10 caracteres'),
  type: z.enum(roomTypes),
  capacity: z
    .coerce
    .number()
    .int('La capacidad debe ser un número entero')
    .min(1, 'La capacidad mínima es de una persona')
    .max(10, 'La capacidad máxima permitida es de 10 personas'),
  pricePerNight: z
    .coerce
    .number()
    .min(0, 'El precio por noche no puede ser negativo')
    .max(100000, 'El precio por noche es demasiado alto'),
  amenities: z
    .string()
    .trim()
    .max(300, 'Las amenidades no pueden exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
  isAvailable: z.boolean().default(true),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type RoomFormValues = z.input<typeof roomSchema>;
export type RoomSchemaOutput = z.output<typeof roomSchema>;
