import { z } from 'zod'

export const AuthPayloadSchema = z.object(
    {
        username: z.string().nullable(),
        first_name: z.string().nullable(),
        last_name: z.string().nullable(),
        role: z.string().nullable(),
        flag: z.string().nullable(),
    }
) 