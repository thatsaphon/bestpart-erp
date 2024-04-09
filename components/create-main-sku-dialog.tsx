'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { createMainSku } from '@/app/actions/inventory/createMainSku'
import { useFormState } from 'react-dom'
import toast from 'react-hot-toast'

type Props = {}

export default function CreateMainSkuDialog({}: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'outline'}>สร้างสินค้าหลัก</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>สร้างสินค้าหลัก</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        try {
                            await createMainSku(formData)
                            toast.success('Main SKU created')
                        } catch (error) {
                            console.log(error)
                            toast.error('fail')
                        }
                    }}
                >
                    <Label>
                        ชื่อสินค้าหลัก{' '}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        placeholder="กรอกชื่อสินค้าหลัก"
                        required
                        name="name"
                    />
                    <Label className="mt-2">Part-Number</Label>
                    <Input placeholder="Optional" name="partNumber" />
                    <DialogFooter className="mt-4">
                        <Button type="submit">Submit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
