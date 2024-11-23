'use client'

import {
    Atom,
    Bird,
    BookOpen,
    Bot,
    Box,
    ChevronsUpDown,
    Code2,
    Contact,
    Eclipse,
    Frame,
    History,
    LifeBuoy,
    Map,
    NotepadText,
    PieChart,
    Rabbit,
    Send,
    Settings,
    Settings2,
    SquareTerminal,
    Star,
    Turtle,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { StorageCard } from '@/components/storage-card'
import { TeamSwitcher } from '@/components/team-switcher'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import { FullRoute } from '@/types/routes/document-routes'
import Link from 'next/link'
import { DashboardIcon } from '@radix-ui/react-icons'
import { useSession } from 'next-auth/react'
import { useSearchParams, usePathname } from 'next/navigation'
import CollapsibleSidebarItem from './collapsible-sidebar-item'
import { useIsMobile } from '@/hooks/use-mobile'
import { SheetHeader } from './ui/sheet'
import { DialogTitle } from './ui/dialog'
import GenerateBarcodeButton from './generate-barcode-button'
import QuickSearchInventory from './quick-search-inventory'
import { ModeToggle } from './mode-toggle'
const data = {
    teams: [
        {
            name: 'Best Part',
            logo: Eclipse,
            plan: 'Enterprise',
        },
    ],
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        // avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
        {
            title: 'งานขาย',
            url: '/sales',
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: 'บิลขาย',
                    url: FullRoute.Sales,
                    icon: History,
                    description: 'View your recent prompts',
                },
                {
                    title: 'รับคืนสินค้า',
                    url: FullRoute.SalesReturn,
                    icon: Star,
                    description: 'Browse your starred prompts',
                },
                {
                    title: 'ใบวางบิล',
                    url: FullRoute.SalesBill,
                    icon: Settings2,
                    description: 'Configure your playground',
                },
                {
                    title: 'ใบเสนอราคา',
                    url: FullRoute.Quotation,
                    icon: Settings2,
                    description: 'Configure your playground',
                },
                {
                    title: 'ใบจองสินค้า',
                    url: FullRoute.CustomerOrder,
                    icon: Settings2,
                    description: 'Configure your playground',
                },
                {
                    title: 'ใบเสร็จรับเงิน',
                    url: FullRoute.SalesReceived,
                    icon: Settings2,
                    description: 'Configure your playground',
                },
            ],
        },
        {
            title: 'จัดซื้อ',
            url: '/purchase',
            icon: Bot,
            items: [
                {
                    title: 'ใบสั่งซื้อ',
                    url: FullRoute.PurchaseOrder,
                    icon: Rabbit,
                    description: 'Our fastest model for general use cases.',
                },
                {
                    title: 'ใบเสร็จรับของ',
                    url: FullRoute.Purchase,
                    icon: Bird,
                    description: 'Performance and speed for efficiency.',
                },
                {
                    title: 'ใบลดหนี้/คืนสินค้า',
                    url: FullRoute.PurchaseReturn,
                    icon: Bird,
                    description: 'Performance and speed for efficiency.',
                },
                {
                    title: 'ใบสำคัญจ่าย',
                    url: FullRoute.PurchasePayment,
                    icon: Turtle,
                    description:
                        'The most powerful model for complex computations.',
                },
            ],
        },
        {
            title: 'ผู้ติดต่อ',
            url: '/contact',
            icon: BookOpen,
            items: [
                {
                    title: 'ผู้ติดต่อ',
                    url: '/contact',
                },
            ],
        },

        {
            title: 'สินค้า',
            url: '#',
            icon: Code2,
            items: [
                {
                    title: 'สินค้า',
                    url: '/inventory',
                },
            ],
        },
        {
            title: 'บัญชี',
            url: '/accounting',
            icon: Settings2,
            items: [
                {
                    title: 'ผังบัญชี',
                    url: FullRoute.ChartOfAccounts,
                },
                {
                    title: 'งบทดลอง',
                    url: FullRoute.BalanceSheet,
                },
                {
                    title: 'เงินสด',
                    url: FullRoute.Cash,
                },
                {
                    title: 'สินทรัพย์',
                    url: FullRoute.AssetManagement,
                },
                {
                    title: 'ใบเสร็จอื่น',
                    url: FullRoute.OtherInvoice,
                },
                {
                    title: 'ใบสำคัญจ่ายอื่น',
                    url: FullRoute.OtherPayment,
                },
                {
                    title: 'รายการปรับปรุง',
                    url: FullRoute.JournalVoucher,
                },
            ],
        },
        {
            title: 'Admin',
            url: '/admin',
            icon: Contact,
            items: [
                {
                    title: 'ผู้ดูแลระบบ',
                    url: '/admin',
                },
                {
                    title: 'ผู้ใช้งาน',
                    url: '/admin/user',
                },
                {
                    title: 'Dashboard',
                    url: '/admin/dashboard',
                },
            ],
        },
        {
            title: 'ตั้งค่า',
            url: '/setting',
            icon: Settings2,
            items: [
                {
                    title: 'Non-stock item',
                    url: '/setting/non-stock-item',
                    icon: Box,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    // const session = useSession()
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader className="mb-2 border-b-2 py-1">
                <Link href={'/'}>
                    <SidebarMenuButton
                        tooltip={'SPS Autoparts'}
                        className="h-[44px] p-2"
                    >
                        <Settings className="p-0" />
                        <span>Sangpiamsuk Autoparts</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarHeader>
            <SidebarContent className="-mt-4">
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === '/'}
                            >
                                <Link
                                    href={`/${
                                        searchParams.get('database')
                                            ? '?database=' +
                                              searchParams.get('database')
                                            : ''
                                    }`}
                                >
                                    {<DashboardIcon />}
                                    <span>หน้าแรก</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {data.navMain.map((item) => (
                            <CollapsibleSidebarItem
                                key={item.title}
                                title={item.title}
                                url={item.url}
                                icon={item.icon}
                                isActive={pathname === item.url}
                                items={item.items}
                            />
                        ))}
                        <SidebarMenuItem className="md:hidden">
                            <QuickSearchInventory />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-end gap-2 md:hidden">
                        <GenerateBarcodeButton />
                        <ModeToggle />
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* <NavUser
                    user={{
                        name:
                            session.data?.user.username ||
                            session.data?.user.last_name ||
                            '',
                        role: session.data?.user.role || '',
                        avatar: session.data?.user.avatarUrl || '',
                    }}
                /> */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

// const AdminSidebarItem = () => {
//     const session = useSession()
//     return (
//         <>
//             {session.data?.user.USER_POSN === 1 && (
//                 <CollapsibleSidebarItem
//                     title="รายงานผู้บริหาร"
//                     url="/reports"
//                     icon={NotepadText}
//                     isActive={true}
//                     items={[
//                         {
//                             title: 'ยอดขายรายลูกหนี้',
//                             url: '/reports/ar-custom-range',
//                         },
//                         {
//                             title: 'ยอดขายรายลูกหนี้ เฉพาะสินค้า',
//                             url: '/reports/ar-per-product',
//                         },
//                     ]}
//                 />
//             )}
//         </>
//     )
// }
