'use client'

import React, { useEffect } from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'

type BreadcrumbUrlProps = {
    href: string
    label: string
}

type Props = {}

export default function BreadcrumbUrl({}: Props) {
    const [items, setItems] = React.useState<BreadcrumbUrlProps[]>([])
    const pathName = usePathname()

    useEffect(() => {
        const newItems = pathName
            .split('/')
            .map(
                (item, index, arr) =>
                    ({
                        href: `/${arr.slice(1, index + 1).join('/')}`,
                        label: item
                            .split('-')
                            .map(
                                (item) =>
                                    item.charAt(0).toUpperCase() + item.slice(1)
                            )
                            .join(' '),
                    }) as BreadcrumbUrlProps
            )
            .filter((item) => item.href !== '/')
        setItems(newItems)
    }, [pathName])

    return (
        <Breadcrumb className="ml-3">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {items.length > 0 && <BreadcrumbSeparator />}
                {items.map((item, index) => (
                    <React.Fragment key={item.href}>
                        <BreadcrumbItem key={item.href}>
                            <BreadcrumbLink href={item.href}>
                                {item.label}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index !== items.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
