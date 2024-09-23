import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PurchaseReturn',
}

type Props = {
    children: React.ReactNode
}

export default function layout({ children }: Props) {
    return <>{children}</>
}
