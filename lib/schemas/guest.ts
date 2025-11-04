import { z } from "zod";

export const guestSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  lastName: z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  email: z.string().trim().email("Ingresa un correo válido"),
  phone: z
    .string()
    .trim()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres"),
  documentType: z.enum(["ine", "pasaporte", "licencia", "otro"]),
  documentNumber: z
    .string()
    .trim()
    .min(4, "El número de documento debe tener al menos 4 caracteres")
    .max(30, "El número de documento no puede exceder 30 caracteres"),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type GuestFormValues = z.infer<typeof guestSchema>;
