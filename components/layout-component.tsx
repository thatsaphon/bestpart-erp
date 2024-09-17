import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import { NavMenubar } from '@/components/nav-menubar'
import UserAvatar from './user-avatar'
import Link from 'next/link'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { SidebarLayout, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { cookies } from 'next/headers'
import QuickSearchInventory from './quick-search-inventory'

export default async function LayoutComponent({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    return (
        <SidebarLayout
            defaultOpen={cookies().get('sidebar:state')?.value === 'true'}
            className=""
        >
            <AppSidebar />
            <div className="flex min-h-screen flex-col">
                <div className="flex w-full items-center justify-between bg-background py-1 pr-5">
                    <div className="flex w-screen items-center justify-end pr-5">
                        <div className="mr-2 flex items-center gap-2">
                            <QuickSearchInventory />
                            <ModeToggle />
                            <UserAvatar user={session?.user} />
                        </div>
                    </div>
                </div>
                <Separator />

                <div className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
                    <div className="h-full rounded-md border-2 border-dashed p-2">
                        {children}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    )
}
