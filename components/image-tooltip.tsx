'use client'

import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'
import { CardDescription } from './ui/card'
import { ImageIcon, ZoomInIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { SkuMasterImage } from '@prisma/client'
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from './ui/context-menu'
import useSecondDisplayStore from '@/store/second-display-store'
import { Button } from './ui/button'

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
                            <div className="relative grid w-[650px] grid-cols-3 gap-2 pb-2">
                                {images?.map((image, index) => (
                                    <div className="hover:children:(2)/absolute group relative">
                                        <Image
                                            src={image.path}
                                            alt={`${alt}-${index}`}
                                            key={image.path}
                                            unoptimized
                                            width={500}
                                            height={500}
                                        />
                                        <div className="absolute left-0 top-0 z-20 hidden h-full w-full items-center justify-center bg-primary/80 group-hover:flex">
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        store.images.find(
                                                            (i) =>
                                                                i === image.path
                                                        )
                                                    ) {
                                                        return store.removeImage(
                                                            image.path
                                                        )
                                                    }
                                                    store.addImage(image.path)
                                                }}
                                            >
                                                {store.images.find(
                                                    (i) => i === image.path
                                                )
                                                    ? 'Remove Image'
                                                    : 'Add Image'}
                                            </Button>
                                        </div>
                                    </div>
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
