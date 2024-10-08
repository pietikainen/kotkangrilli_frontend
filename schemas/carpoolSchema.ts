import { z } from 'zod';

const carpoolSchema = z
  .object({
    id: z.number().min(1).optional(),
    eventId: z.number().min(1),
    driverId: z.coerce.number().min(1),
    seats: z.number().min(1),
    departureCity: z.string().min(1).max(255),
    departureTime: z.date(),
  })
  .refine((data) => data.departureTime > new Date(), {
    message: 'Lähtöajan tulee olla myöhemmin kuin nyt',
    path: ['departureTime'],
  });

export default carpoolSchema;
