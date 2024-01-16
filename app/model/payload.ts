import { z } from 'zod'

export const AuthPayloadSchema = z.object(
    {
        username: z.string(),
        first_name: z.string().nullable(),
        last_name: z.string().nullable(),
        role: z.string().nullable(),
        flag: z.record(z.string()),
        avatarUrl: z.string().nullable(),
    }
) 