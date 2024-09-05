import { z } from 'zod';

export const userSchema = z.object({
  id: z.number().min(1),
  snowflake: z.bigint(),
  username: z.string().min(1).max(255),
  nickname: z.string().min(1).max(255).optional(),
  avatar: z.string().min(4).max(255),
  email: z.string().min(6).max(255).optional(),
  phone: z.string().min(5).optional(),
  bankaccount: z.string().min(1).optional(),
  userlevel: z.coerce.number().min(0).max(9),
});
