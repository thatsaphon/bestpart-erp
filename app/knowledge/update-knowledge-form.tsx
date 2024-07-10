'use client'
import { Textarea } from '@/components/ui/textarea'
import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { updateKnowledge } from './update-knowledge'

type Props = {
    knowledge: { id: number; content: string }
}

export default function UpdateKnowledgeForm({ knowledge }: Props) {
    const form = useRef<HTMLFormElement>(null)
    return (
        <form
            ref={form}
            className="grid grid-cols-[1fr_100px] gap-1"
            action={async (formData) => {
                try {
                    const content = formData.get('content')
                    if (typeof content !== 'string' || !content)
                        return toast.error('กรุณากรอกข้อมูล')
                    await updateKnowledge(knowledge.id, content)
                    toast.success('บันทึกข้อมูลสำเร็จ')
                    form.current?.reset()
                } catch (err) {
                    toast.error('บันทึกข้อมูลไม่สำเร็จ')
                }
            }}
        >
            <Textarea name="content" defaultValue={knowledge.content} />
            <Button>ยืนยัน</Button>
        </form>
    )
}
