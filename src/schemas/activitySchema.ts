import { z } from "zod";

const activitySchema = z.object({
  id: z.number().min(1).optional(),
  eventId: z.number().min(1).optional(),
  title: z.string().min(1).max(255),
  startDate: z.date(),
  endDate: z.date(),
  color: z.string().min(1).max(255),
});

export default activitySchema;
