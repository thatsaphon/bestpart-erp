import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from './ui/context-menu'
import React, { Fragment, RefObject, useEffect, useRef, useState } from 'react'
import { Input } from './ui/input'
import { SkuMaster, Brand, CarModel, GoodsMaster } from '@prisma/client'
import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'

type Props = {
    children: React.ReactNode
    skuMaster: SkuMaster & {
        brand?: Brand | null
        carModel?: CarModel | null
        goodsMasters: GoodsMaster[]
    }
}

export default function InventoryDialogContextMenu({
    children,
    skuMaster,
}: Props) {
    const ref = useRef<HTMLInputElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    // useEffect(() => {
    //     console.log(file)
    //     if (file) setIsOpen(true)
    // }, [file])

    return (
        <Fragment>
            <ContextMenu>
                <ContextMenuTrigger>{children}</ContextMenuTrigger>
                <ContextMenuContent>
                    {/* <Input
                        ref={ref}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                            // setFile(ref.current?.files?.[0] || null)
                            setFile(e.target.files?.[0] || null)
                            setIsOpen((prev) => !prev)
                        }}
                    />
                    <ContextMenuItem onClick={() => ref.current?.click()}>
                        Upload Picture
                    </ContextMenuItem> */}
                    {/* <ContextMenuItem>Billing</ContextMenuItem>
                <ContextMenuItem>Team</ContextMenuItem>
            <ContextMenuItem>Subscription</ContextMenuItem> */}
                </ContextMenuContent>
            </ContextMenu>
        </Fragment>
    )
}