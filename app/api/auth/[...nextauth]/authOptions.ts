//@ts-ignore
import prisma from '@/app/db/db'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { nextDay } from 'date-fns'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: {
                    label: 'Username',
                    type: 'text',
                    placeholder: 'jsmith',
                },
                password: { label: 'Password', type: 'password' },
                email: { label: 'email', type: 'email' },
            },
            async authorize(credentials, req) {
                // You need to provide your own logic here that takes the credentials
                // submitted and returns either a object representing a user or value
                // that is false/null if the credentials are invalid.
                // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
                // You can also use the `req` object to obtain additional parameters
                // (i.e., the request IP address)

                const user = await prisma.user.findUnique({
                    where: { username: credentials?.username },
                })
                if (
                    user &&
                    (await bcrypt.compare(
                        credentials?.password as string,
                        user.password
                    ))
                ) {
                    return {
                        id: user.id,
                        username: user.username,
                        first_name: user.first_name ?? '',
                        last_name: user.last_name ?? '',
                        role: user.role,
                        avatarUrl: user.avatarUrl ?? '',
                        email: '',
                    }
                } else {
                    throw new Error('Invalid email or password')
                }
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60,
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id
                token.username = user.username
                token.first_name = user.first_name
                token.last_name = user.last_name
                token.role = user.role
                token.avatarUrl = user.avatarUrl
            }
            return token
        },
        session: async ({ session, token }) => {
            // revalidatePath('/')
            // await setCookies()
            if (session.user) {
                session.user.id = token.id
                session.user.username = token.username
                session.user.first_name = token.first_name
                session.user.last_name = token.last_name
                session.user.role = token.role
                session.user.avatarUrl = token.avatarUrl
            }
            return session
        },
    },
}
