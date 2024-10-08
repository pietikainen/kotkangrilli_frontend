import { z } from 'zod';

const mealSchema = z.object({
  id: z.number().min(1).optional(),
  eventId: z.number().min(1).optional(),
  chefId: z.number().min(1).optional(),
  name: z.string().min(1).max(255),
  description: z.string().min(0).max(255).optional(),
  price: z.coerce.number().min(0),
  mobilepay: z.boolean(),
  banktransfer: z.boolean(),
});

export default mealSchema;
