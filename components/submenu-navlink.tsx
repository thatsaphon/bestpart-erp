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
        'hover:bg-accent/50 w-full py-2',
        usePathname() === href && 'bg-accent',
        className
      )}
    >
      {label}
    </Link>
  )
}
