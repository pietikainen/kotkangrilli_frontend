import { z } from "zod";

const gameSchema = z.object({
  id: z.number().min(1).optional(),
  externalApiId: z.number().min(0),
  title: z.string().min(1).max(255),
  image: z.string().min(4).max(255).optional(),
  price: z.coerce.number().min(0).max(10),
  link: z.string().url().min(4).max(255),
  store: z.string().min(1).max(255),
  players: z.coerce.number().min(1),
  isLan: z.boolean(),
  submittedBy: z.number().min(0).optional(),
  description: z.string().min(0).max(180).optional(),
});

export default gameSchema;
