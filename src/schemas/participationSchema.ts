import { z } from "zod";

const participationSchema = z.object({
  id: z.number().min(1),
  eventId: z.number().min(1),
  userId: z.number().min(1),
  arrivalDate: z.date(),
});

export default participationSchema;
