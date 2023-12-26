import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import * as jose from 'jose'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = request.cookies.get('token')


    if (request.nextUrl.pathname.startsWith('/auth/login')) {
        request.cookies.delete('token')
        return NextResponse.next()
    }

    if (!token) return NextResponse.redirect(new URL('/auth/login', request.url))

    try {
        const requestHeaders = new Headers(request.headers)
        const payload = await jose.jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
        requestHeaders.set('user', JSON.stringify(payload.payload.data))
        return NextResponse.next({
            headers: requestHeaders
        })
    }
    catch (err) {
        request.cookies.delete('token')
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/', '/auth/:path*'],

}