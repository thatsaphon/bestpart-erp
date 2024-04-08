'use client'
import { cookies } from 'next/headers'
import React from 'react'
import { Toaster } from 'react-hot-toast'

type Props = {}

export default function ServerToast({}: Props) {
    const cookieStore = cookies()
    return (
        <>
            <Toaster />
        </>
    )
}
