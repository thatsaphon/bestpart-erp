import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    const user = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Get the pathname of the request
    const { pathname } = request.nextUrl
    if (pathname === '/login') {
        return NextResponse.next()
    }

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If the pathname starts with /protected and the user is not an admin, redirect to the home page
    // if (pathname.startsWith('/protected') && (!user || user.role !== 'admin')) {
    //   return NextResponse.redirect(new URL('/', request.url))
    // }

    // Continue with the request if the user is an admin or the route is not protected
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/',
        '/admin/:path*',
        '/sales/:path*',
        '/purchase/:path*',
        '/inventory/:path*',
        '/contact/:path*',
        '/((?!api|_next/static|_next/image|favicon.ico|knowledge).*)',
    ],
}
