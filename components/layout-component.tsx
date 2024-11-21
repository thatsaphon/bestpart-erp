import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import UserAvatar from './user-avatar'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'
import { AppSidebar } from './app-sidebar'
import { cookies } from 'next/headers'
import QuickSearchInventory from './quick-search-inventory'
import BreadcrumbUrl from './breadcrumb-url'
import GenerateBarcodeButton from './generate-barcode-button'
import { setCookies } from '@/actions/set-cookies'
import { Button } from './ui/button'
import OpenSecondDisplayButton from './open-second-display-button'
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from './ui/sidebar'

export default async function LayoutComponent({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    // const cookieStore = await cookies()
    // const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true'
    // console.log(cookieStore.get('sidebar:state')?.value)

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex shrink-0 items-center gap-2 py-1 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 h-4 w-4" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <BreadcrumbUrl />
                    </div>
                    <div className="ml-auto mr-8 flex items-center gap-2">
                        <div className="hidden items-center gap-2 md:flex">
                            <GenerateBarcodeButton />
                            <OpenSecondDisplayButton />
                            <QuickSearchInventory />
                            <ModeToggle />
                        </div>
                        <UserAvatar user={session?.user} />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="h-full rounded-md border-2 border-dashed p-2">
                        {children}
                    </div>
                    {/* {children} */}
                </div>
                {/* <div className="flex min-h-screen flex-col">
                    <div className="flex w-full items-center justify-between bg-background py-1 pr-5">
                        <div className="flex w-screen items-center justify-between pr-5">
                            <div className="flex gap-2">
                                <SidebarTrigger />
                                <BreadcrumbUrl />
                            </div>

                            <div className="mr-2 flex items-center gap-2">
                                <OpenSecondDisplayButton />
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
                </div> */}
            </SidebarInset>
        </SidebarProvider>
    )
}
