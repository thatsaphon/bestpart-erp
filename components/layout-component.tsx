import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import { NavMenubar } from '@/components/nav-menubar'
import UserAvatar from './user-avatar'
import Link from 'next/link'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'

export default async function LayoutComponent({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex h-14 w-screen items-center justify-between pr-5">
                <Link
                    className="mr-5 flex h-7 items-center justify-center rounded-full
        px-4 text-center text-sm font-bold text-primary transition-colors"
                    href={'/'}
                >
                    BestPart Alai
                </Link>
                <nav className="flex flex-1 space-x-6">
                    <NavMenubar />
                </nav>
                <div className="mr-2 flex items-center gap-2">
                    <ModeToggle />
                    <UserAvatar user={session?.user} />
                </div>
            </div>
            <Separator />

            {children}
        </div>
    )
}
