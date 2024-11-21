'use client'

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible'
import { ChevronRight, LucideIcon } from 'lucide-react'
import React from 'react'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from './ui/sidebar'
import { usePathname, useSearchParams } from 'next/navigation'

type Props = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export default function CollapsibleSidebarItem({
  title,
  url,
  icon,
  isActive,
  items,
}: Props) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  return (
    <Collapsible
      key={title}
      asChild
      defaultOpen={isActive}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title}>
            {icon && React.createElement(icon)}
            <span>{title}</span>
            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.url}
                >
                  <a
                    href={`${subItem.url}${
                      searchParams.get('database')
                        ? '?database=' + searchParams.get('database')
                        : ''
                    }`}
                  >
                    <span>{subItem.title}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
