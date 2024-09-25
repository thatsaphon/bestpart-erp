import type { Metadata } from 'next'
import { Inter as FontSans, Sarabun } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import LayoutComponent from '@/components/layout-component'
import { getServerSession } from 'next-auth'

import SessionProvider from '@/components/session-provider'
import { authOptions } from './api/auth/[...nextauth]/authOptions'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getServiceAndNonStockItemsDefaultFunction } from '@/types/service-and-non-stock-item/service-and-non-stock-item'
import { setCookies } from '@/actions/set-cookies'

export const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const fontThai = Sarabun({
    subsets: ['thai', 'latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    variable: '--font-thai',
})

export const metadata: Metadata = {
    title: 'Best Part',
}

export default async function RootLayout({
    children,
    request,
}: {
    children: React.ReactNode
    request: NextRequest
}) {
    const session = await getServerSession(authOptions)

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    fontThai.variable,
                    fontSans.variable
                )}
            >
                <SpeedInsights />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionProvider session={session}>
                        {session && (
                            <LayoutComponent>{children}</LayoutComponent>
                        )}
                        {!session && children}
                    </SessionProvider>

                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
