import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import * as jose from 'jose'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    if (request.nextUrl.pathname.startsWith('/auth/login')) {
        request.cookies.delete('token')
        return NextResponse.next()
        // return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const token = request.cookies.get('token')

    if (!token) return NextResponse.redirect(new URL('/auth/login', request.url))

    try {
        const payload = await jose.jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
        const response = NextResponse.next()
        response.headers.set('user', JSON.stringify(payload.payload.data))
        return response
    }
    catch (err) {
        request.cookies.delete('token')
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/:path*',
}