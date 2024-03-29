import NextAuth from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      username: string
      first_name: string
      last_name: string
      role: string
      flag: { [key: string]: any }
      avatarUrl: string
    }
  }
  interface User {
    username: string
    first_name: string
    last_name: string
    role: string
    flag: { [key: string]: any }
    avatarUrl: string
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    username: string
    first_name: string
    last_name: string
    role: string
    flag: { [key: string]: any }
    avatarUrl: string
  }
}
