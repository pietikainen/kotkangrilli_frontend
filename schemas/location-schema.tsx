"use client";

import { z } from "zod";

export const locationSchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  capacity: z.number().min(2),
  description: z.string().min(1).max(255),
  price: z.number().min(0),
});
