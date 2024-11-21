'use client'

import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TrashIcon } from '@radix-ui/react-icons'
import { deleteKnowledge } from './delete-knowledge'
import toast from 'react-hot-toast'
import { KnowledgeImage } from '@prisma/client'

type Props = {
    knowledge: { id: number; content: string; KnowledgeImage: KnowledgeImage[] }
}

export default function DeleteAlert({ knowledge }: Props) {
    return (
        <AlertDialog>
            <AlertDialogTrigger
                asChild
                disabled={knowledge.KnowledgeImage.length > 0}
            >
                <TrashIcon className="h-5 w-5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ต้องการลบเนื้อหานี้ใช่หรือไม่
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        หากลบแล้วจะไม่สามารถกู้คืนมาได้
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            try {
                                await deleteKnowledge(knowledge.id)
                                toast.success('ลบสำเร็จ')
                            } catch (err) {
                                toast.error('ไม่สามารถลบได้')
                            }
                        }}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
