import { z } from "zod";

const participationSchema = z.object({
  id: z.number().min(1),
  eventId: z.number().min(1),
  userId: z.number().min(1),
  arrivalDate: z.date(),
  paid: z.number().min(0).max(2),
});

export default participationSchema;
