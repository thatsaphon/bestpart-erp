import SubMenuNavLink from '@/components/submenu-navlink'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Admin',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="grid flex-1 grid-cols-[200px_5px_1fr]">
            <div className="flex flex-col items-center text-center">
                <Separator />
                <SubMenuNavLink href="/admin" label="หน้าหลัก" />
                <Separator />
            </div>
            <Separator orientation="vertical" className="h-full" />
            <div className="mb-2 p-3">{children}</div>
        </div>
    )
}
