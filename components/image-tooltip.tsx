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

type Props = {
    images?: { path: string }[]
    alt?: string
}

export default function ImageToolTip({ images, alt = 'image' }: Props) {
    return (
        <>
            {images && images.length ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ImageIcon className="inline h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="grid w-[650px] grid-cols-3 gap-2 pb-2">
                                {images?.map((image, index) => (
                                    <Image
                                        src={image.path}
                                        alt={`${alt}-${index}`}
                                        key={image.path}
                                        unoptimized
                                        width={500}
                                        height={500}
                                    />
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
