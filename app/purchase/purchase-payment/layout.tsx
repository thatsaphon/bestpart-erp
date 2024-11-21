import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: 'ใบสำคัญจ่าย',
}

type Props = {
    children: React.ReactNode
}

export default function layout({ children }: Props) {
    return <>{children}</>
}
