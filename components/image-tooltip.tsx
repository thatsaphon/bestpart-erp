'use client'

import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'
import { CardDescription } from './ui/card'
import { ImageIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { SkuMasterImage } from '@prisma/client'
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from './ui/context-menu'
import useSecondDisplayStore from '@/store/second-display-store'

type Props = {
    images?: { path: string }[]
    alt?: string
}

export default function ImageToolTip({ images, alt = 'image' }: Props) {
    const store = useSecondDisplayStore()
    const [open, setOpen] = React.useState(false)
    return (
        <>
            {images && images.length ? (
                <TooltipProvider>
                    <Tooltip open={open} onOpenChange={setOpen}>
                        <TooltipTrigger asChild>
                            <ImageIcon className="inline h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent hideWhenDetached={false}>
                            <div className="grid w-[650px] grid-cols-3 gap-2 pb-2">
                                {images?.map((image, index) => (
                                    <ContextMenu>
                                        <ContextMenuTrigger>
                                            <Image
                                                src={image.path}
                                                alt={`${alt}-${index}`}
                                                key={image.path}
                                                unoptimized
                                                width={500}
                                                height={500}
                                            />
                                        </ContextMenuTrigger>
                                        <ContextMenuContent
                                            onMouseEnter={() => setOpen(true)}
                                        >
                                            {!store.images.find(
                                                (i) => i === image.path
                                            ) ? (
                                                <ContextMenuItem
                                                    onClick={() =>
                                                        store.addImage(
                                                            image.path
                                                        )
                                                    }
                                                >
                                                    Add to Second Display
                                                </ContextMenuItem>
                                            ) : (
                                                <ContextMenuItem
                                                    onClick={() =>
                                                        store.removeImage(
                                                            image.path
                                                        )
                                                    }
                                                >
                                                    Remove from Second Display
                                                </ContextMenuItem>
                                            )}
                                        </ContextMenuContent>
                                    </ContextMenu>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                <></>
            )}
        </>
    )
}
