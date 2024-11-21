'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

type Props = {
    label: string
    href: string
    className?: string
}

export default function SubMenuNavLink({ label, href, className }: Props) {
    return (
        <Link
            href={href}
            className={cn(
                'w-full py-2 hover:bg-accent/50',
                usePathname().startsWith(href) && 'bg-accent',
                className
            )}
        >
            {label}
        </Link>
    )
}
