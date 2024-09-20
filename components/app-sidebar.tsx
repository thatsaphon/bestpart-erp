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
    PieChart,
    Rabbit,
    Send,
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
    SidebarHeader,
    SidebarItem,
    SidebarLabel,
} from '@/components/ui/sidebar'
import { FullRoute } from '@/types/routes/document-routes'
import Link from 'next/link'
import { title } from 'process'
import { url } from 'inspector'
const data = {
    teams: [
        {
            name: 'Best Part',
            logo: Eclipse,
            plan: 'Enterprise',
        },
        // {
        //     name: 'Acme Corp.',
        //     logo: Eclipse,
        //     plan: 'Startup',
        // },
        // {
        //     name: 'Evil Corp.',
        //     logo: Rabbit,
        //     plan: 'Free',
        // },
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
                // {
                //     title: 'ผู้ติดต่อ',
                //     url: '/contact',
                // },
                // {
                //     title: 'Get Started',
                //     url: '#',
                // },
                // {
                //     title: 'Tutorials',
                //     url: '#',
                // },
                // {
                //     title: 'Changelog',
                //     url: '#',
                // },
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
                // {
                //     title: 'Completion',
                //     url: '#',
                // },
                // {
                //     title: 'Images',
                //     url: '#',
                // },
                // {
                //     title: 'Video',
                //     url: '#',
                // },
                // {
                //     title: 'Speech',
                //     url: '#',
                // },
            ],
        },
        {
            title: 'บัญชี',
            url: '#',
            icon: Settings2,
            items: [
                {
                    title: 'ผังบัญชี',
                    url: '/accounting',
                },
                {
                    title: 'งบดุล',
                    url: '/accounting/balance-sheet',
                },
                {
                    title: 'เงินสด',
                    url: '/accounting/cash',
                },
                {
                    title: 'สินทรัพย์',
                    url: '/accounting/asset-management',
                },
                {
                    title: 'ใบเสร็จอื่น',
                    url: '/accounting/other-invoice',
                },
                {
                    title: 'ใบสำคัญจ่ายอื่น',
                    url: '/accounting/other-payment',
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

    navSecondary: [
        {
            title: 'Support',
            url: '#',
            icon: LifeBuoy,
        },
        {
            title: 'Feedback',
            url: '#',
            icon: Send,
        },
    ],
    projects: [
        {
            name: 'Design Engineering',
            url: '#',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart,
        },
        {
            name: 'Travel',
            url: '#',
            icon: Map,
        },
    ],
    searchResults: [
        {
            title: 'Routing Fundamentals',
            teaser: 'The skeleton of every application is routing. This page will introduce you to the fundamental concepts of routing for the web and how to handle routing in Next.js.',
            url: '#',
        },
        {
            title: 'Layouts and Templates',
            teaser: 'The special files layout.js and template.js allow you to create UI that is shared between routes. This page will guide you through how and when to use these special files.',
            url: '#',
        },
        {
            title: 'Data Fetching, Caching, and Revalidating',
            teaser: 'Data fetching is a core part of any application. This page goes through how you can fetch, cache, and revalidate data in React and Next.js.',
            url: '#',
        },
        {
            title: 'Server and Client Composition Patterns',
            teaser: 'When building React applications, you will need to consider what parts of your application should be rendered on the server or the client. ',
            url: '#',
        },
        {
            title: 'Server Actions and Mutations',
            teaser: 'Server Actions are asynchronous functions that are executed on the server. They can be used in Server and Client Components to handle form submissions and data mutations in Next.js applications.',
            url: '#',
        },
    ],
}

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                {/* <TeamSwitcher teams={data.teams} /> */}
                <Link
                    href={'/'}
                    className="flex items-center gap-1.5 overflow-hidden px-2 py-1.5 text-left text-sm transition-all"
                >
                    <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                        <Eclipse className="h-3.5 w-3.5 shrink-0" />
                    </div>
                    <div className="line-clamp-1 flex-1 pr-2 font-medium">
                        BestPart Alai
                    </div>
                    {/* <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" /> */}
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarItem>
                    <SidebarLabel>Navigation</SidebarLabel>
                    <NavMain
                        items={data.navMain}
                        searchResults={data.searchResults}
                    />
                </SidebarItem>
                <SidebarItem>
                    <SidebarLabel>Favourites</SidebarLabel>
                    <NavProjects projects={data.projects} />
                </SidebarItem>
                <SidebarItem className="mt-auto">
                    <SidebarLabel>Help</SidebarLabel>
                    <NavSecondary items={data.navSecondary} />
                </SidebarItem>
                <SidebarItem>
                    <StorageCard />
                </SidebarItem>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
