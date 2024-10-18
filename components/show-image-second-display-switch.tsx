'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import useSecondDisplayStore from '@/store/second-display-store'

type Props = {}

export default function ShowImageSecondDisplaySwitch({}: Props) {
    const store = useSecondDisplayStore()

    return (
        <Card className="fixed bottom-5 right-5 flex flex-col items-center justify-center space-y-2 p-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Show</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Second Display</DialogTitle>
                    </DialogHeader>
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
