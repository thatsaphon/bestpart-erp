'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useRef } from 'react'
import { addNewKnowledge } from './add-new-knowledge'
import toast from 'react-hot-toast'
import { Textarea } from '@/components/ui/textarea'

type Props = {}

export default function AddNewKnowledgeForm({}: Props) {
    const form = useRef<HTMLFormElement>(null)
    return (
        <form
            ref={form}
            className="grid grid-cols-[1fr_100px] gap-1"
            action={async (formData) => {
                try {
                    if (!formData.get('content'))
                        return toast.error('กรุณากรอกข้อมูล')

                    await addNewKnowledge(formData)
                    toast.success('บันทึกข้อมูลสำเร็จ')
                    form.current?.reset()
                } catch (err) {
                    toast.error('บันทึกข้อมูลไม่สำเร็จ')
                }
            }}
        >
            <Textarea name="content" />
            <Button>ยืนยัน</Button>
        </form>
    )
}
