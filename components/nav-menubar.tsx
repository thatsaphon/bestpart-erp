'use client'

import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar-modified'
import { cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'
import { useSession } from 'next-auth/react'
// import { navigationMenuTriggerStyle } from './ui/navigation-menu'

export function NavMenubar() {
    const pathName = usePathname()
    const session = useSession()
    return (
        <Menubar className="space-x-2">
            <MenubarMenu>
                <Link href={'/'}>
                    <MenubarTrigger
                        className={cn(pathName === '/' && 'bg-accent')}
                    >
                        หน้าหลัก
                    </MenubarTrigger>
                </Link>
            </MenubarMenu>
            <MenubarMenu>
                {!pathName.includes('/sales') ? (
                    <Link href={'/sales/sales-order'}>
                        <MenubarTrigger
                            className={cn(
                                pathName.includes('/sales') && 'bg-accent'
                            )}
                        >
                            งานขาย
                        </MenubarTrigger>
                    </Link>
                ) : (
                    <>
                        <MenubarTrigger
                            className={cn(
                                pathName.includes('/sales') && 'bg-accent'
                            )}
                        >
                            งานขาย
                        </MenubarTrigger>
                        <MenubarContent>
                            <Link href={'/sales/sales-order/create'}>
                                <MenubarItem>สร้างบิลขาย</MenubarItem>
                            </Link>
                            <Link href={'/sales/sales-return/create'}>
                                <MenubarItem>สร้างใบรับคืนสินค้า</MenubarItem>
                            </Link>
                            <Link href={'/sales/sales-bill/create'}>
                                <MenubarItem>สร้างใบวางบิล</MenubarItem>
                            </Link>
                            <Link href={'/sales/quotation/create'}>
                                <MenubarItem>สร้างใบเสนอราคา</MenubarItem>
                            </Link>
                            <Link href={'/sales/customer-order/create'}>
                                <MenubarItem>สร้างใบจองสินค้า</MenubarItem>
                            </Link>
                        </MenubarContent>
                    </>
                )}
            </MenubarMenu>
            <MenubarMenu>
                <Link href={'/purchase/purchase-received'}>
                    <MenubarTrigger
                        className={cn(
                            pathName.includes('/purchase') && 'bg-accent'
                        )}
                    >
                        จัดซื้อ
                    </MenubarTrigger>
                </Link>
            </MenubarMenu>
            <MenubarMenu>
                <Link href={'/contact'}>
                    <MenubarTrigger
                        className={cn(
                            pathName.includes('/contact') && 'bg-accent'
                        )}
                    >
                        ผู้ติดต่อ
                    </MenubarTrigger>
                </Link>
            </MenubarMenu>
            <MenubarMenu>
                <Link href={'/inventory'}>
                    <MenubarTrigger
                        className={cn(
                            pathName.includes('/inventory') && 'bg-accent'
                        )}
                    >
                        คลังสินค้า
                    </MenubarTrigger>
                </Link>
            </MenubarMenu>
            <MenubarMenu>
                <Link href={'/accounting'}>
                    <MenubarTrigger
                        className={cn(
                            pathName.includes('/accounting') && 'bg-accent'
                        )}
                    >
                        บัญชี
                    </MenubarTrigger>
                </Link>
            </MenubarMenu>
            {session.data?.user.role === 'ADMIN' && (
                <MenubarMenu>
                    <Link href={'/admin'}>
                        <MenubarTrigger
                            className={cn(
                                pathName.includes('/admin') && 'bg-accent'
                            )}
                        >
                            ผู้ดูแลระบบ
                        </MenubarTrigger>
                    </Link>
                </MenubarMenu>
            )}
        </Menubar>
    )
}
