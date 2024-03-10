import { z } from 'zod'

export const SkuFlagSchema = z.object({
    tags: z.array(z.string()).optional(),
})