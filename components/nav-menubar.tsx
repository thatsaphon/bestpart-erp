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
import { InventoryDialog } from './inventory-dialog'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
// import { navigationMenuTriggerStyle } from './ui/navigation-menu'

export function NavMenubar() {
  const pathName = usePathname()
  return (
    <Menubar>
      <MenubarMenu>
        <Link href={'/'}>
          <MenubarTrigger className={cn(pathName === '/' && 'bg-accent')}>
            หน้าหลัก
          </MenubarTrigger>
        </Link>
      </MenubarMenu>
      <MenubarMenu>
        <Link href={'/sales'}>
          <MenubarTrigger
            className={cn(pathName.includes('/sales') && 'bg-accent')}
          >
            งานขาย
          </MenubarTrigger>
        </Link>
      </MenubarMenu>
      <MenubarMenu>
        <Link href={'/purchase'}>
          <MenubarTrigger
            className={cn(pathName.includes('/purchase') && 'bg-accent')}
          >
            จัดซื้อ
          </MenubarTrigger>
        </Link>
      </MenubarMenu>
      <MenubarMenu>
        <Link href={'/inventory'}>
          <MenubarTrigger
            className={cn(pathName.includes('/inventory') && 'bg-accent')}
          >
            คลังสินค้า
          </MenubarTrigger>
        </Link>
      </MenubarMenu>
      <MenubarMenu>
        <Link href={'/accounting'}>
          <MenubarTrigger
            className={cn(pathName.includes('/accounting') && 'bg-accent')}
          >
            บัญชี
          </MenubarTrigger>
        </Link>
      </MenubarMenu>
    </Menubar>
  )
}
