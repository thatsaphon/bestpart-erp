'use client'

import useSecondDisplayStore from '@/store/second-display-store'
import { OpenInNewWindowIcon } from '@radix-ui/react-icons'
import React from 'react'

type Props = {}

export default function OpenSecondDisplayButton({}: Props) {
    const { openCustomerWindow } = useSecondDisplayStore()

    return (
        <OpenInNewWindowIcon
            onClick={openCustomerWindow}
            className="hover:cursor-pointer"
        />
    )
}
