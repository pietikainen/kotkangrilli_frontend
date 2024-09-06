import { z } from 'zod';

const eventSchema = z
  .object({
    id: z.number().min(1).optional(),
    title: z.string().min(1).max(255),
    description: z.string().min(0).max(255).optional(),
    location: z.coerce.number().min(1),
    winnerGamesCount: z.number().min(3).max(5),
    startDate: z.date(),
    endDate: z.date(),
    votingOpen: z.boolean(),
    active: z.boolean(),
    lanMaster: z.coerce.number().min(1).optional(),
    paintCompoWinner: z.coerce.number().min(1).optional(),
    organizer: z.coerce.number().min(1).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Loppumispäivän tulee olla myöhemmin kuin alkamispäivän',
    path: ['endDate'],
  });

export default eventSchema;
