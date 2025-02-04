import { z } from "zod";

const locationSchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  capacity: z.coerce.number().min(2),
  description: z.string().min(1).max(255),
  price: z.coerce.number().min(0),
});

export default locationSchema;
