import { z } from "zod";

const eaterSchema = z.object({
  id: z.number().min(1).optional(),
  eaterId: z.number().min(1),
  mealId: z.number().min(1),
  paid: z.number().min(0),
  comment: z.string().max(255).optional(),
});

export default eaterSchema;
