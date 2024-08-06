"use client"

import { z } from "zod"

export const gameSchema = z.object({
    gameName: z.string().min(1).max(50),
    gamePrice: z.coerce.number().min(0),
    gameStore: z.string().min(1).max(50),
    gameDescription: z.string().min(0).max(180).optional(),
    gameLink: z.string().min(0).max(100).optional(),
    gamePlayers: z.coerce.number().min(0).max(128),
    gameIsLan: z.boolean(),
})