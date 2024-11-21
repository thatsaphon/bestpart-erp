'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import useSecondDisplayStore from '@/store/second-display-store'
import Image from 'next/image'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from './ui/carousel'
import { Maximize2, Minimize, Minimize2Icon } from 'lucide-react'

type Props = {}

export default function ShowImageSecondDisplaySwitch({}: Props) {
    const store = useSecondDisplayStore()
    const [minimized, setMinimized] = React.useState(false)

    if (minimized) {
        return (
            <Card
                onClick={() => {
                    setMinimized(false)
                }}
                className="fixed bottom-5 right-5 flex items-center justify-center space-x-2 p-4 opacity-50 hover:cursor-pointer hover:opacity-100"
            >
                <Maximize2 />
            </Card>
        )
    }

    return (
        <Card className="fixed bottom-5 right-5 flex flex-col items-center justify-center space-y-2 p-4 opacity-50 hover:opacity-100">
            <Minimize2Icon
                onClick={() => {
                    setMinimized(true)
                }}
                className="absolute right-3 top-3 h-5 w-5 cursor-pointer"
            />
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Show</Button>
                </DialogTrigger>
                <DialogContent className="flex h-[80vh] w-[600px] max-w-[80vw] flex-col items-center justify-center">
                    <DialogHeader>
                        <DialogTitle>Second Display</DialogTitle>
                    </DialogHeader>
                    <div className="flex h-full flex-col items-center justify-between">
                        <div className="flex h-full items-center justify-center">
                            {store.images[store.imageIndex] && (
                                <Image
                                    src={store.images[store.imageIndex]}
                                    alt="image"
                                    width={500}
                                    height={500}
                                    unoptimized
                                    className="max-h-[50vh] w-auto"
                                />
                            )}
                        </div>
                        <Carousel
                            opts={{
                                align: 'start',
                            }}
                            className="w-full max-w-sm"
                        >
                            <CarouselContent>
                                {store.images.map((image, index) => (
                                    <CarouselItem
                                        key={index}
                                        className="basis-1/3"
                                    >
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex aspect-square h-full items-center p-6">
                                                    <Image
                                                        src={image}
                                                        alt="image"
                                                        width={500}
                                                        height={500}
                                                        unoptimized
                                                        className="hover:cursor-pointer"
                                                        onClick={() => {
                                                            store.setImageIndex(
                                                                index
                                                            )
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="flex items-center space-x-2">
                <Switch
                    id="airplane-mode"
                    checked={store.showImage}
                    onCheckedChange={store.setShowImage}
                />
                <Label htmlFor="airplane-mode">Show Image</Label>
            </div>
        </Card>
    )
}
