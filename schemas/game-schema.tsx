"use client";

import { z } from "zod";

export const gameSchema = z.object({
  title: z.string().min(1).max(50),
  price: z.coerce.number().min(0),
  store: z.string().min(1).max(50),
  description: z.string().min(0).max(180).optional(),
  link: z.string().min(0).max(100).optional(),
  players: z.coerce.number().min(0).max(128),
  isLan: z.boolean(),
});
