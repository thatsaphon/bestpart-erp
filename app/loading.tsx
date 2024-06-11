import LayoutComponent from '@/components/layout-component'
import SubMenuNavLink from '@/components/submenu-navlink'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

type Props = {}

export default function loading({}: Props) {
    return (
        <div className="grid flex-1 grid-cols-[200px_5px_1fr] p-4">
            <div className="flex flex-col items-center text-center"></div>
            <Separator orientation="vertical" className="h-full" />
            <Skeleton className="h-12 w-[250px]" />
        </div>
    )
}
